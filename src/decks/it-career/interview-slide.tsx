'use client';

import type { LucideIcon } from 'lucide-react';
import { Lightbulb, MessageCircleQuestion, Smile, Wrench } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаги 0–2: по группе вопросов. Шаг 3: что делать, если не знаете ответ. */

interface Group {
  title: string;
  sub: string;
  icon: LucideIcon;
  tone: Tone;
  items: string[];
  tip: string;
  caption: string;
}

const GROUPS: Group[] = [
  {
    title: 'О вас',
    sub: 'вопросы HR и тимлида',
    icon: Smile,
    tone: 'guard',
    items: ['Расскажите о себе', 'Почему хотите к нам?', 'Что сделали сами?'],
    tip: 'ответ на минуту, без заучивания',
    caption: 'Про вас: коротко и по делу, с примером из проекта',
  },
  {
    title: 'Техника',
    sub: 'вопросы разработчика',
    icon: Wrench,
    tone: 'logic',
    items: ['Чем фронтенд отличается от бэкенда?', 'Что такое миграция и зачем она?', 'Что значит ответ 404?'],
    tip: 'спросят то, что есть в резюме',
    caption: 'Техника: основы из резюме и ваших проектов',
  },
  {
    title: 'Ваши вопросы',
    sub: 'в конце спросите вы',
    icon: MessageCircleQuestion,
    tone: 'git',
    items: ['Кто будет моим ментором?', 'Какой будет первая задача?', 'Как оценят стажировку?'],
    tip: 'нет вопросов — тоже сигнал',
    caption: 'Ваши вопросы: вы тоже выбираете, где учиться',
  },
];

const W = 464;
const G = 24;
const CARD_H = 420;

export function InterviewSlide({ step }: SlideProps) {
  const cur = GROUPS[step];
  const rule = step >= GROUPS.length;
  return (
    <SlideLayout section="hiring" title="Собеседование: о чём спрашивают">
      {GROUPS.map((g, i) => {
        const t = TONE[g.tone];
        const active = step === i;
        return (
          <Reveal key={g.title} show={step >= i} from="up" className="absolute" style={{ left: i * (W + G), top: 0, width: W }}>
            <div
              className={cn(
                'card flex flex-col gap-4 border-t-[6px] p-6 transition-[box-shadow,opacity] duration-300',
                t.border,
                active && t.ring,
                !active && 'opacity-60',
              )}
              style={{ height: CARD_H }}
            >
              <div className="flex items-center gap-4">
                <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                  <g.icon size={30} />
                </span>
                <div>
                  <div className="text-[32px] font-bold leading-tight">{g.title}</div>
                  <div className="text-[19px] text-text-2">{g.sub}</div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {g.items.map((q) => (
                  <div key={q} className={cn('rounded-xl px-4 py-2.5 text-[24px] leading-snug', t.soft)}>
                    «{q}»
                  </div>
                ))}
              </div>
              <div className={cn('mt-auto text-[21px] font-semibold', t.text)}>{g.tip}</div>
            </div>
          </Reveal>
        );
      })}

      <Reveal show={rule} from="up" className="absolute" style={{ left: 0, top: CARD_H + 20, width: 1440 }}>
        <div className={cn('flex items-center gap-6 rounded-3xl border-2 px-8 py-5', TONE.warning.border, TONE.warning.soft)}>
          <span className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white', TONE.warning.bg)}>
            <Lightbulb size={36} />
          </span>
          <div className="flex-1">
            <div className="text-[34px] font-bold leading-tight">Не знаете ответ? Рассуждайте вслух</div>
            <div className="text-[24px] text-text-2">«Точно не помню, но думаю так…» — это лучше, чем выдумывать или молчать</div>
          </div>
        </div>
      </Reveal>

      <StepCaption step={step} tone={cur?.tone ?? 'warning'} captions={[...GROUPS.map((g) => g.caption), null]} />
    </SlideLayout>
  );
}
