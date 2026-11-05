'use client';

import { motion } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { ROLES, type RoleKey } from './data';
import { RoleIcon } from './parts';

/** Шаг 0 — шесть ситуаций, шаги 1–6 — по ответу. Пусть зал отвечает до клика. */

interface Case {
  situation: string;
  role: RoleKey;
  why: string;
  caption: string;
}

const CASES: Case[] = [
  { situation: 'Что показывать, если промокод истёк?', role: 'analyst', why: 'это требования — их пишет аналитик', caption: 'Как должно работать → аналитик' },
  { situation: 'Две срочные задачи — какую делать первой?', role: 'pm', why: 'порядок задач решает продакт', caption: 'Что важнее → продакт' },
  { situation: 'Не знаю, как лучше сделать это в коде', role: 'lead', why: 'совет и ревью — тимлид или ментор', caption: 'Как сделать в коде → тимлид' },
  { situation: 'Как должна выглядеть ошибка под полем?', role: 'design', why: 'смотрим макет, вопросы — дизайнеру', caption: 'Как выглядит → дизайнер' },
  { situation: 'Сайт не открывается ни у кого', role: 'devops', why: 'серверы — DevOps. И сразу в общий канал', caption: 'Упал сервер → DevOps' },
  { situation: 'Хочу взять отпуск в августе', role: 'hr', why: 'договориться с лидом, оформить — через HR', caption: 'Отпуск → лид и HR' },
];

const CARD_W = 464;
const CARD_H = 258;
const GAP = 24;

export function QuizSlide({ step }: SlideProps) {
  const current = CASES[step - 1];
  return (
    <SlideLayout section="outro" title="К кому идти?">
      {CASES.map((c, i) => {
        const r = ROLES[c.role];
        const t = TONE[r.tone];
        const revealed = i < step;
        const isCurrent = i === step - 1;
        return (
          <motion.div
            key={c.situation}
            className="absolute"
            style={{ left: (i % 3) * (CARD_W + GAP), top: Math.floor(i / 3) * (CARD_H + GAP), width: CARD_W, height: CARD_H }}
            initial={false}
            animate={{ opacity: step === 0 || revealed ? 1 : 0.55 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className={cn('card flex h-full flex-col px-6 py-5 transition-[border-color,box-shadow] duration-300', isCurrent && cn(t.border, t.ring))}>
              <div className="text-[26px] font-semibold leading-snug">«{c.situation}»</div>
              <div className="mt-auto">
                <Swap k={revealed ? 'answer' : 'question'}>
                  {revealed ? (
                    <div className="flex items-center gap-4">
                      <RoleIcon role={c.role} size={56} />
                      <div className="min-w-0">
                        <div className="text-[25px] font-bold leading-tight">{r.name}</div>
                        <div className="text-[20px] leading-snug text-text-2">{c.why}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-14 items-center gap-3 text-[24px] font-semibold text-muted">
                      <CircleHelp size={30} /> Кто поможет?
                    </div>
                  )}
                </Swap>
              </div>
            </div>
          </motion.div>
        );
      })}

      <StepCaption
        step={step}
        tone={current ? ROLES[current.role].tone : 'accent'}
        captions={['Ситуация → к кому идти? Сначала ответьте сами', ...CASES.map((c) => c.caption)]}
      />
    </SlideLayout>
  );
}
