'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowUp, Clock, Compass, Layers, Target } from 'lucide-react';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { OverviewPanel } from './parts';

/** Шаг 0 — лесенка целиком, шаги 1–4 — по грейду. Сроки — ориентир, не правило. */

interface Grade {
  name: string;
  tone: Tone;
  works: string;
  example: string;
  time: string;
  caption: string;
}

const GRADES: Grade[] = [
  {
    name: 'Стажёр',
    tone: 'accent',
    works: 'учится: задачи выдают и разбирают вместе',
    example: 'поправить текст ошибки промокода',
    time: '2–3 месяца',
    caption: 'Стажёр: учится на небольших задачах рядом с ментором',
  },
  {
    name: 'Junior',
    tone: 'prisma',
    works: 'делает задачу по готовому описанию, со сложным просит помощи',
    example: 'поле ввода промокода по макету',
    time: 'обычно первые 1–2 года',
    caption: 'Junior: решает понятные задачи и просит помощи',
  },
  {
    name: 'Middle',
    tone: 'logic',
    works: 'берёт задачу целиком, сам находит решение и доводит до релиза',
    example: 'весь промокод: от базы до кнопки',
    time: 'примерно 2–4 года опыта',
    caption: 'Middle: ведёт задачу самостоятельно от начала до конца',
  },
  {
    name: 'Senior',
    tone: 'git',
    works: 'решает, как делать, отвечает за результат и учит других',
    example: 'придумать, как хранить промокоды и не сломать скидки',
    time: 'от 4–5 лет опыта',
    caption: 'Senior: отвечает за решения и растит других',
  },
];

const BLOCK_W = 150;
const BLOCK_GAP = 8;
const HEIGHTS = [130, 215, 300, 385];
const FLOOR = 520;
const PANEL_LEFT = 660;
const PANEL_W = 780;

export function GradesSlide({ step }: SlideProps) {
  const cur = GRADES[step - 1];
  return (
    <SlideLayout section="grades" title="Грейды: ступени роста">
      <div className="absolute flex items-center gap-2 text-[22px] font-semibold text-muted" style={{ left: 0, top: 0 }}>
        <ArrowUp size={24} strokeWidth={3} />
        самостоятельность и ответственность
      </div>

      {GRADES.map((g, i) => {
        const t = TONE[g.tone];
        const active = step === i + 1;
        const h = HEIGHTS[i];
        return (
          <div
            key={g.name}
            className={cn(
              'absolute flex items-start justify-center rounded-t-2xl border-2 border-b-0 pt-4 text-[26px] font-bold transition-[box-shadow,background-color,color] duration-300',
              t.border,
              active ? cn(t.bg, 'text-white', t.ring) : cn(t.soft, t.text),
            )}
            style={{ left: i * (BLOCK_W + BLOCK_GAP), top: FLOOR - h, width: BLOCK_W, height: h }}
          >
            {g.name}
          </div>
        );
      })}
      <div className="absolute bg-border" style={{ left: 0, top: FLOOR, width: 4 * (BLOCK_W + BLOCK_GAP) - BLOCK_GAP, height: 3 }} />

      <div className="absolute" style={{ left: PANEL_LEFT, top: 30, width: PANEL_W, height: FLOOR - 30 }}>
        <Swap k={step} className="h-full">
          {cur ? <GradePanel grade={cur} height={FLOOR - 30} /> : <OverviewPanel icon={Layers} tone="logic" title="Грейд — уровень специалиста" text="Чем выше ступень, тем больше самостоятельности и ответственности. Название ступени у всех своё, смысл — один" height={FLOOR - 30} />}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={cur?.tone ?? 'logic'}
        captions={['Четыре ступени. Сроки — ориентир: в каждой компании свои', ...GRADES.map((g) => g.caption)]}
      />
    </SlideLayout>
  );
}

function GradePanel({ grade, height }: { grade: Grade; height: number }) {
  const t = TONE[grade.tone];
  const rows: { icon: LucideIcon; label: string; text: string }[] = [
    { icon: Compass, label: 'как работает', text: grade.works },
    { icon: Target, label: 'задача на PROMO-12', text: grade.example },
    { icon: Clock, label: 'ориентир по времени', text: grade.time },
  ];
  return (
    <div className={cn('card flex flex-col justify-center gap-7 border-l-[8px] px-9', t.border)} style={{ height }}>
      <div className={cn('text-[46px] font-extrabold leading-none', t.text)}>{grade.name}</div>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-center gap-2 text-[17px] font-semibold uppercase tracking-wider text-muted">
            <r.icon size={18} strokeWidth={2.5} />
            {r.label}
          </div>
          <div className="mt-1 text-[27px] font-semibold leading-snug">{r.text}</div>
        </div>
      ))}
    </div>
  );
}
