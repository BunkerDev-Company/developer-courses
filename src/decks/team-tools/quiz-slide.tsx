'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, CircleHelp, Gauge, GitPullRequest, Layers, MessageSquare, Ticket } from 'lucide-react';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаг 0 — шесть ситуаций, шаги 1–6 — по ответу. Пусть зал отвечает до клика. */

interface Case {
  situation: string;
  answer: string;
  icon: LucideIcon;
  tone: Tone;
  caption: string;
}

const CASES: Case[] = [
  {
    situation: 'Посреди спринта продакт приносит срочную задачу',
    answer: 'Договориться: что убрать из спринта или взять в следующий',
    icon: CalendarDays,
    tone: 'ctrl',
    caption: 'Цель спринта защищают — но договариваются',
  },
  {
    situation: 'На покере планирования выпали 2 и 13',
    answer: 'Крайние объясняют свои оценки — и голосуем снова',
    icon: Layers,
    tone: 'ctrl',
    caption: 'Разброс оценок — повод поговорить',
  },
  {
    situation: 'В колонке «В работе» уже 3 задачи при лимите 3',
    answer: 'Не брать новую — помочь доделать или проверить чужой PR',
    icon: Gauge,
    tone: 'prisma',
    caption: 'Лимит WIP: сначала доделай',
  },
  {
    situation: 'В трекере задача «Сделать промокоды» — и всё',
    answer: 'Вернуть на уточнение: нет истории и критериев приёмки',
    icon: Ticket,
    tone: 'guard',
    caption: 'Без критериев задачу не проверить',
  },
  {
    situation: 'CI красный, но коллега говорит: «там мелочь, давай вольём»',
    answer: 'Не вливать. Сломанный main мешает всей команде',
    icon: GitPullRequest,
    tone: 'git',
    caption: 'Красные проверки = merge нельзя',
  },
  {
    situation: 'Ревьюер написал под вашим PR: «так себе»',
    answer: 'Спросить, что именно не так, — и самим писать по формуле',
    icon: MessageSquare,
    tone: 'success',
    caption: 'Факт → последствие → предложение',
  },
];

const CARD_W = 464;
const CARD_H = 258;
const GAP = 24;

export function QuizSlide({ step }: SlideProps) {
  const current = CASES[step - 1];
  return (
    <SlideLayout section="outro" title="Что делать?">
      {CASES.map((c, i) => {
        const t = TONE[c.tone];
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
              <div className="text-[25px] font-semibold leading-snug">{c.situation}</div>
              <div className="mt-auto">
                <Swap k={revealed ? 'answer' : 'question'}>
                  {revealed ? (
                    <div className="flex items-start gap-4">
                      <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                        <c.icon size={26} />
                      </span>
                      <div className="text-[21px] font-semibold leading-snug">{c.answer}</div>
                    </div>
                  ) : (
                    <div className="flex h-14 items-center gap-3 text-[24px] font-semibold text-muted">
                      <CircleHelp size={30} /> Как поступить?
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
        tone={current ? current.tone : 'accent'}
        captions={['Ситуация → как поступить? Сначала ответьте сами', ...CASES.map((c) => c.caption)]}
      />
    </SlideLayout>
  );
}
