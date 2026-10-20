'use client';

import { Cpu, Database, ListOrdered, ShieldCheck } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { Card } from '../parts';

/**
 * Шаги:
 * 0 — симуляция чистая: наружу только SimHooks
 * 1 — waveCleared → очередь комнаты: операции с базой строго по порядку
 * 2 — saveWave: волна засчитывается один раз, золото с мобов — через журнал
 * 3 — что в памяти, а что в базе
 */

const CODES: { title: string; code: string; hl: number[] }[] = [
  {
    title: 'domain/sim/sim.ts — комментарий перенесён по ширине',
    code: `export interface SimHooks {
  /** Волна началась (по таймеру или все готовы). */
  waveStarted(plan: WavePlan): void;
  /** Все мобы волны мертвы. Комната сохраняет
   *  прогресс и выдаёт награды. */
  waveCleared(plan: WavePlan): void;
  playerDown(pid: number): void;
  playerRevived(pid: number): void;
  /** Пали все герои, кто в игре. */
  allDown(): void;
}`,
    hl: [1, 6, 10],
  },
  {
    title: 'application/services/rooms.service.ts',
    code: `waveCleared: (plan: WavePlan) => {
  void this.enqueue(room, () => this.onWaveCleared(room, plan));
},
…
/** Операции с базой одной комнаты — строго по очереди. */
private enqueue<T>(room: Room, fn: () => Promise<T>): Promise<T> {
  const next = room.queue.then(fn, fn);
  room.queue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}`,
    hl: [2, 5, 7],
  },
  {
    title: 'run-store.service.ts — saveWave, выдержка',
    code: `await this.prisma.$transaction(async (tx) => {
  …
  const { count } = await tx.run.updateMany({
    where: { id: p.runId, status: 'active', waves_cleared: p.wave - 1 },
    data: { waves_cleared: p.wave, date_update_at: new Date() },
  });
  if (count === 0)
    this.errors.throw('WAVE_OUT_OF_ORDER', 'Эта волна уже засчитана');
  …
  const balance = await this.wallet.credit(
    tx, pl.userId, gold, 'loot',
    \`loot:\${p.runId}:\${p.wave}:\${pl.userId}\`,
  );`,
    hl: [4, 7, 8, 12],
  },
  {
    title: 'rooms.service.ts — комментарий к классу',
    code: `/**
 * Состояние живёт в памяти процесса. Для нескольких
 * инстансов нужен «липкий» роутинг комнат по серверам
 * (или выделенные игровые серверы) — в базу уходят
 * только итоги (RunStoreService).
 */`,
    hl: [2, 3, 5],
  },
];

const CODE_W = 900;
const RX = CODE_W + 40;
const RW = 1440 - RX;

export function StoreSlide({ step }: SlideProps) {
  const c = CODES[step];
  return (
    <SlideLayout section="realtime" title="В базу — только итоги боя">
      <div className="absolute" style={{ left: 0, top: 0, width: CODE_W }}>
        <Swap k={step}>
          <Code code={c.code} lang="ts" size="sm" title={c.title} hl={c.hl} tone={step === 2 ? 'prisma' : 'logic'} />
        </Swap>
      </div>

      <div className="absolute" style={{ left: RX, top: 0, width: RW }}>
        <Swap k={step}>
          {step === 0 && (
            <Card tone="logic" icon={Cpu} title="Симуляция чистая">
              <div className="text-[23px] leading-snug">
                <M>domain/sim</M> не знает ни Nest, ни базу. Наружу — только события через хуки.
              </div>
            </Card>
          )}
          {step === 1 && (
            <Card tone="logic" icon={ListOrdered} title="Очередь комнаты">
              <div className="text-[23px] leading-snug">Сохранение волны и конец забега не обгонят друг друга: промисы выстроены в цепочку.</div>
            </Card>
          )}
          {step === 2 && (
            <Card tone="prisma" icon={ShieldCheck} title="Волна засчитывается один раз">
              <div className="flex flex-col gap-2 text-[22px] leading-snug">
                <span>
                  Условие <M>waves_cleared = wave − 1</M> — повтор не пройдёт.
                </span>
                <span>Золото с мобов — через тот же журнал, ref уникален.</span>
              </div>
            </Card>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <Card tone="logic" icon={Cpu} title="В памяти · 20 раз/с">
                <div className="text-[22px] leading-snug">мобы, снаряды, HP, позиции героев</div>
              </Card>
              <Card tone="db" icon={Database} title="В базе · итоги">
                <div className="text-[22px] leading-snug">волны, золото, награды, сундуки; позиции — раз в 5 с</div>
              </Card>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 2 ? 'prisma' : 'logic'}
        captions={[
          'Симуляция не знает про базу: она только сообщает, что случилось',
          'Хуки ставят запись в очередь комнаты — строго по порядку',
          <>
            <M>saveWave</M>: одна транзакция, повтор волны — <M>WAVE_OUT_OF_ORDER</M>
          </>,
          'Бой живёт в памяти, в базу — итоги. Отсюда «липкий» роутинг комнат',
        ]}
      />
    </SlideLayout>
  );
}
