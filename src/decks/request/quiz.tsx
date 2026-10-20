'use client';

import { motion } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Swap } from '@/components/ui/reveal';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { ROLES, type RoleKey } from './restaurant';

/**
 * Игра «Где сломалось?»: четыре симптома сеткой 2×2. Шаг 0 — только вопросы,
 * шаги 1–4 — по одному открываются ответы: кто из ресторана виноват и почему.
 */

export interface QuizCase {
  /** Что отправили / что запустили: `POST /api/v1/items`. */
  request: string;
  /** Обстоятельства — обычным шрифтом: «без токена». */
  note: string;
  /** Что увидели: ответ сервера или строка из консоли. Можно в две строки. */
  symptom: string;
  role: RoleKey;
  /** Конкретное место в коде: `JwtAuthGuard`. */
  culprit: string;
  why: React.ReactNode;
}

const CARD_W = 704;
const CARD_H = 262;
const GAP = 32;

function Card({ c, revealed, current }: { c: QuizCase; revealed: boolean; current: boolean }) {
  const r = ROLES[c.role];
  const t = TONE[r.tone];
  return (
    <div
      className={cn(
        'card flex h-full flex-col px-6 py-5 transition-[border-color,box-shadow] duration-300',
        current && cn(t.border, t.ring),
      )}
    >
      <div className="flex items-baseline gap-4">
        <span className="whitespace-nowrap font-mono text-[22px] font-bold">{c.request}</span>
        <span className="truncate text-[20px] text-text-2">{c.note}</span>
      </div>
      <div className="mt-3 whitespace-pre-line rounded-xl bg-code-bg px-3 py-2.5 font-mono text-[19px] leading-snug text-code-prop">
        {c.symptom}
      </div>
      <div className="mt-auto">
        <Swap k={revealed ? 'answer' : 'question'}>
          {revealed ? (
            <div className="flex items-center gap-4">
              <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                <r.icon size={30} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="text-[26px] font-bold">{r.name}</span>
                  <span className={cn('truncate font-mono text-[20px] font-semibold', t.text)}>{c.culprit}</span>
                </div>
                <div className="text-[21px] leading-snug text-text-2">{c.why}</div>
              </div>
            </div>
          ) : (
            <div className="flex h-14 items-center gap-3 text-[24px] font-semibold text-muted">
              <CircleHelp size={30} /> Кто виноват?
            </div>
          )}
        </Swap>
      </div>
    </div>
  );
}

interface Props {
  step: number;
  title: React.ReactNode;
  cases: QuizCase[];
  /** Подпись к шагу 0 и к каждому открытому ответу. */
  captions: React.ReactNode[];
}

export function Quiz({ step, title, cases, captions }: Props) {
  const current = cases[step - 1];
  return (
    <SlideLayout section="request" title={title}>
      {cases.map((c, i) => (
        <motion.div
          key={c.request + c.note}
          className="absolute"
          style={{ left: (i % 2) * (CARD_W + GAP), top: Math.floor(i / 2) * (CARD_H + 24), width: CARD_W, height: CARD_H }}
          initial={false}
          animate={{ opacity: step === 0 || i < step ? 1 : 0.55 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <Card c={c} revealed={i < step} current={i === step - 1} />
        </motion.div>
      ))}
      <StepCaption step={step} tone={current ? ROLES[current.role].tone : 'accent'} captions={captions} />
    </SlideLayout>
  );
}
