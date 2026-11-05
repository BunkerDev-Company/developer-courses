'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Brain, CircleHelp, GitPullRequest, HeartHandshake, MessagesSquare, RefreshCcw, Target } from 'lucide-react';
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
  why: string;
  icon: LucideIcon;
  tone: Tone;
  caption: string;
}

const CASES: Case[] = [
  {
    situation: 'На собеседовании не знаете ответ',
    answer: 'Рассуждать вслух',
    why: 'покажите ход мыслей, не выдумывайте',
    icon: Brain,
    tone: 'logic',
    caption: 'Не знаете ответ → рассуждайте вслух',
  },
  {
    situation: 'Три часа сидите над одной ошибкой',
    answer: 'Спросить в канале',
    why: 'с текстом ошибки и тем, что пробовали',
    icon: MessagesSquare,
    tone: 'ctrl',
    caption: 'Застряли → спросите, а не сидите молча',
  },
  {
    situation: 'В вашем ПР двенадцать комментариев',
    answer: 'Это нормально',
    why: 'исправьте, уточните, скажите спасибо',
    icon: GitPullRequest,
    tone: 'success',
    caption: 'Много комментариев → так учатся',
  },
  {
    situation: 'Хотите расти быстрее',
    answer: 'Составить ИПР',
    why: 'обсудите цели с тимлидом на 1:1',
    icon: Target,
    tone: 'git',
    caption: 'Хочу расти → план развития с тимлидом',
  },
  {
    situation: 'Пришёл оффер, но не всё понятно',
    answer: 'Спросить у HR',
    why: 'срок, график, оплата, кто ментор',
    icon: HeartHandshake,
    tone: 'guard',
    caption: 'Оффер неясен → вопросы до подписания',
  },
  {
    situation: 'Вас не взяли на стажировку',
    answer: 'Попросить отзыв',
    why: 'и откликнуться в другие места',
    icon: RefreshCcw,
    tone: 'warning',
    caption: 'Отказ → отзыв и следующая попытка',
  },
];

const CARD_W = 464;
const CARD_H = 258;
const GAP = 24;

export function QuizSlide({ step }: SlideProps) {
  const current = CASES[step - 1];
  return (
    <SlideLayout section="outro" title="Как поступить?">
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
              <div className="text-[26px] font-semibold leading-snug">«{c.situation}»</div>
              <div className="mt-auto">
                <Swap k={revealed ? 'answer' : 'question'}>
                  {revealed ? (
                    <div className="flex items-center gap-4">
                      <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                        <c.icon size={30} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[25px] font-bold leading-tight">{c.answer}</div>
                        <div className="text-[20px] leading-snug text-text-2">{c.why}</div>
                      </div>
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

      <StepCaption step={step} tone={current?.tone ?? 'accent'} captions={['Ситуация → что делать? Сначала ответьте сами', ...CASES.map((c) => c.caption)]} />
    </SlideLayout>
  );
}
