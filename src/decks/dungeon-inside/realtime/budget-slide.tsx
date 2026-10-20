'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Server } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE, range } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Card } from '../parts';

/**
 * Sim.applyInputs — бюджет шагов ввода:
 * 0 — честный клиент: 60 шагов/с, бюджет пополняется на 60/с — всегда полон
 * 1 — спидхак ×2: 120 шагов/с — бюджет пустеет за полсекунды, лишние шаги выбрасываются
 * 2 — «резинка»: клиент убежал вперёд в предсказании, снимок сервера возвращает героя
 * 3 — правило целиком: 60 шагов/с реального времени + 30 запаса
 */

// domain/sim/sim.ts — applyInputs, выдержка (без строки p.lastBudgetAt = nowMs).
const CODE = `p.inputBudget = Math.min(
  30,
  p.inputBudget + ((nowMs - p.lastBudgetAt) / 1000) * 60,
);
for (let i = 0; i < steps.length; i++) {
  const seq = firstSeq + i;
  if (seq <= p.lastSeq) continue; // повтор — уже применён
  p.lastSeq = seq;
  if (p.inputBudget < 1) {
    p.droppedInputs++;
    continue;
  }
  p.inputBudget -= 1;
  const [ix, iy, buttons] = steps[i];
  this.stepPlayer(p, ix, iy, buttons);
}`;

const HL = [[1, 2, 3, 13, 15], [9, 10, 11], [8], range(1, 4)];

const CODE_W = 820;
const RX = CODE_W + 40;
const RW = 1440 - RX;

function Gauge({ level, label }: { level: number; label: string }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-[20px]">
        <span className="font-semibold">бюджет шагов</span>
        <span className="font-mono text-text-2">{label}</span>
      </div>
      <div className="h-9 overflow-hidden rounded-xl border-2 border-border bg-surface-2">
        <motion.div
          className={cn('h-full rounded-lg', level > 0.5 ? 'bg-success/70' : 'bg-danger/70')}
          initial={false}
          animate={{ width: `${Math.max(3, level * 100)}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  );
}

function Rates({ sent, applied, dropped }: { sent: number; applied: number; dropped: number }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
      {[
        { n: sent, t: 'прислал', c: 'text-text' },
        { n: applied, t: 'применено', c: 'text-success' },
        { n: dropped, t: 'выброшено', c: dropped ? 'text-danger' : 'text-muted' },
      ].map((x) => (
        <div key={x.t} className="rounded-xl bg-surface-2 py-2">
          <div className={cn('font-mono text-[30px] font-bold', x.c)}>{x.n}</div>
          <div className="text-[17px] text-text-2">{x.t} / с</div>
        </div>
      ))}
    </div>
  );
}

function Track() {
  return (
    <div className="card px-5 py-5">
      <div className="text-[22px] font-bold">Через секунду бега</div>
      <div className="relative mt-6 h-[120px]">
        <div className="absolute inset-x-0 top-[58px] h-1 rounded-full bg-border-2" />
        <div className="absolute flex flex-col items-center" style={{ left: '45%', top: 0, transform: 'translateX(-50%)' }}>
          <Server size={26} className="text-logic" />
          <span className="h-6 w-6 rounded-full bg-logic" />
          <span className="mt-1 text-[17px] font-semibold text-logic">сервер</span>
        </div>
        <div className="absolute flex flex-col items-center" style={{ left: '92%', top: 0, transform: 'translateX(-50%)' }}>
          <Gamepad2 size={26} className="text-danger" />
          <span className="h-6 w-6 rounded-full border-2 border-dashed border-danger" />
          <span className="mt-1 text-[17px] font-semibold text-danger">клиент</span>
        </div>
        <div className="absolute text-[34px] font-bold text-danger" style={{ left: '62%', top: 34 }}>
          ⟵
        </div>
      </div>
      <div className="text-[21px] leading-snug text-text-2">
        Шаги посчитаны в <M>ack</M>, но не применены — снимок сервера возвращает героя назад
      </div>
    </div>
  );
}

export function BudgetSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="realtime" title="Спидхак превращается в «резинку»">
      <Code code={CODE} lang="ts" size="sm" title="domain/sim/sim.ts — applyInputs" hl={HL[step]} tone={step === 1 || step === 2 ? 'danger' : 'logic'} className="absolute" style={{ left: 0, top: 0, width: CODE_W }} />

      <div className="absolute" style={{ left: RX, top: 0, width: RW }}>
        <Swap k={step}>
          {step === 0 && (
            <div className="card px-5 py-5">
              <div className="mb-4 text-[22px] font-bold">Честный клиент</div>
              <Gauge level={1} label="30 из 30" />
              <Rates sent={60} applied={60} dropped={0} />
            </div>
          )}
          {step === 1 && (
            <div className="card px-5 py-5">
              <div className="mb-4 text-[22px] font-bold">Спидхак ×2</div>
              <Gauge level={0} label="пусто через 0.5 с" />
              <Rates sent={120} applied={60} dropped={60} />
            </div>
          )}
          {step === 2 && <Track />}
          {step === 3 && (
            <Card tone="logic" title="Правило из CLAUDE.md игры">
              <div className="flex flex-col gap-2 text-[22px] leading-snug">
                <span>Не больше 60 шагов в секунду реального времени (+30 запаса).</span>
                <span>Лишние шаги засчитываются в ack, но не применяются.</span>
                <span className="text-text-2">Запас — на лаг: пакеты, застрявшие в сети, приходят пачкой.</span>
              </div>
            </Card>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 1 || step === 2 ? 'danger' : 'logic'}
        captions={[
          'Честный клиент: 60 шагов в секунду — и столько же бюджет пополняется',
          'Спидхак шлёт вдвое больше — бюджет пустеет, лишние шаги выбрасываются',
          'Клиент убежал вперёд, сервер — нет: героя дёргает назад, «резинка»',
          'Бюджет 60/с + 30 запаса — и ускорение ввода ничего не даёт',
        ]}
      />
    </SlideLayout>
  );
}
