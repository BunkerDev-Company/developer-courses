'use client';

import { motion } from 'framer-motion';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Card, Console } from '../parts';

/**
 * Шаги:
 * 0 — 20 тиков в секунду, по 50 мс (protocol.ts — общий с клиентом)
 * 1 — таймер по реальному времени: setInterval(50) на Windows неточен
 * 2 — тик: шаг симуляции каждой комнаты + свой снимок каждому игроку
 * 3 — сколько это стоит: реальный прогон scripts/sim-bench.ts
 */

const CONSTS = `/** Частота симуляции на сервере (тиков в секунду). */
export const TICK_RATE = 20;
export const TICK_MS = 1000 / TICK_RATE;`;

// rooms.service.ts — onModuleInit, выдержка (комментарии укорочены).
const TIMER = `// Тик по РЕАЛЬНОМУ времени: setInterval(50) неточен
// (на Windows таймер шагает по ~15.6 мс,
// и 50 превращаются в 62). …
let next = performance.now();
this.timer = setInterval(() => {
  const now = performance.now();
  let n = 0;
  while (now >= next && n < 4) {
    this.loop();
    next += TICK_MS;
    n++;
  }
  if (now - next > TICK_MS * 4) next = now; // сервер стоял …
}, 4);`;

// rooms.service.ts — loop(), выдержка (encodeSnapshot перенесён по ширине).
const LOOP = `for (const room of this.rooms.values()) {
  if (room.status !== 'running' || !room.sim) continue;
  …
  sim.step(TICK_MS / 1000);
  …
  for (const m of room.members.values()) {
    const bytes = encodeSnapshot(
      this.writer,
      sim.buildSnapshot(m.pid),
    );
    for (const s of m.sockets) {
      this.transport?.emitSnapshot(s, bytes);
      …
    }
  }
}`;

const CODE_W = 760;
const RX = CODE_W + 40;
const RW = 1440 - RX;

function Ticks({ highlight }: { highlight: boolean }) {
  return (
    <div className="card px-5 py-4">
      <div className="mb-3 text-[22px] font-bold">1 секунда = 20 тиков</div>
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: highlight ? 1 : 0.5 }}
            transition={{ duration: 0.3, delay: highlight ? i * 0.03 : 0, ease: EASE }}
            className={cn('flex h-10 items-center justify-center rounded-md font-mono text-[15px] font-semibold', 'bg-logic/15 text-logic')}
          >
            {i * 50}
          </motion.div>
        ))}
      </div>
      <div className="mt-3 text-[20px] text-text-2">мс от начала секунды</div>
    </div>
  );
}

export function LoopSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="realtime" title="Цикл 20 Гц: сервер считает бой">
      <div className="absolute" style={{ left: 0, top: 0, width: CODE_W }}>
        <Swap k={step === 0 ? 'c' : step === 1 ? 't' : 'l'}>
          {step === 0 && <Code code={CONSTS} lang="ts" size="sm" title="domain/shared/protocol.ts — общий с клиентом" hl={[2, 3]} tone="logic" />}
          {step === 1 && <Code code={TIMER} lang="ts" size="sm" title="rooms.service.ts — onModuleInit" hl={[5, 8, 9, 10, 14]} tone="logic" />}
          {step >= 2 && <Code code={LOOP} lang="ts" size="sm" title="rooms.service.ts — loop()" hl={step === 2 ? [1, 4, 6, 7, 12] : [4, 7]} tone="logic" />}
        </Swap>
      </div>

      <div className="absolute" style={{ left: RX, top: 0, width: RW }}>
        <Swap k={step}>
          {step === 0 && <Ticks highlight />}
          {step === 1 && (
            <Card tone="logic" title="Почему таймер на 4 мс">
              <div className="flex flex-col gap-2 text-[23px] leading-snug">
                <span>Проверяем часто и делаем столько тиков, сколько положено по часам.</span>
                <span className="text-text-2">
                  От этого зависят часы клиента: он считает «тик × 50 мс = время сервера».
                </span>
              </div>
            </Card>
          )}
          {step === 2 && (
            <Card tone="logic" title="Каждый тик, каждая комната">
              <div className="flex flex-col gap-2 text-[23px] leading-snug">
                <span>
                  <M>sim.step</M>: мобы, снаряды, урон, подбор
                </span>
                <span>каждому игроку — свой снимок: свои мобы рядом и свой ack ввода</span>
                <span className="text-text-2">никого нет в сети — мир стоит</span>
              </div>
            </Card>
          )}
          {step === 3 && (
            <Console
              title="без сервера и базы — реальный вывод"
              lines={[
                { text: '$ npx tsx scripts/sim-bench.ts dungeon 4 60', kind: 'out' },
                { text: 'dungeon: 60 с игры, героев 4', kind: 'dim' },
                { text: '  пройдено волн: 1, мобов сейчас: 14, падений: 0', kind: 'dim' },
                { text: '  тик: среднее 0.038 мс, максимум 2.47 мс', kind: 'ok' },
                { text: '  снимок: в среднем 218 Б, 4 КБ/с на игрока', kind: 'ok' },
              ]}
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="logic"
        captions={[
          'Сервер считает мир 20 раз в секунду — тик раз в 50 мс',
          'Таймер по реальному времени: setInterval(50) на Windows даёт 62 мс',
          'Тик: шаг симуляции — и каждому игроку его снимок мира',
          <>
            Тик стоит <b>0.04 мс</b> из 50 — запас огромный
          </>,
        ]}
      />
    </SlideLayout>
  );
}
