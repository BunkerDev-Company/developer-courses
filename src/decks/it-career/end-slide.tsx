'use client';

import type { LucideIcon } from 'lucide-react';
import { FileText, GitBranch, GraduationCap, Send, Target, TrendingUp } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаг 0 — три темы лекции, шаги 1–4 — по пункту на ближайшие недели. */

const RECAP: { icon: LucideIcon; tone: Tone; title: string; text: string }[] = [
  { icon: GraduationCap, tone: 'warning', title: 'Стажировка', text: 'вход с наставником' },
  { icon: TrendingUp, tone: 'logic', title: 'Грейды', text: 'ступени самостоятельности' },
  { icon: Target, tone: 'git', title: 'ИПР', text: 'рост по письменному плану' },
];

const TODO: { icon: LucideIcon; tone: Tone; title: string; text: string; caption: string }[] = [
  { icon: FileText, tone: 'guard', title: 'Резюме на одну страницу', text: 'факты вместо качеств, ссылка на GitHub', caption: 'Шаг 1: резюме, которое читается за минуту' },
  { icon: GitBranch, tone: 'logic', title: 'Проект на GitHub', text: 'с описанием и инструкцией, как запустить', caption: 'Шаг 2: проект, который можно показать' },
  { icon: Send, tone: 'warning', title: 'Несколько откликов', text: 'не одно место: отказы — часть пути', caption: 'Шаг 3: откликайтесь на несколько стажировок' },
  { icon: Target, tone: 'git', title: 'Свой ИПР на 3 месяца', text: 'цель, шаги, сроки и как проверить', caption: 'Шаг 4: напишите себе план — и начните с него' },
];

const RECAP_H = 110;
const TODO_TOP = 138;
const TODO_W = 708;
const TODO_H = 170;

export function EndSlide({ step }: SlideProps) {
  const cur = TODO[step - 1];
  return (
    <SlideLayout section="outro" title="Ваши ближайшие шаги">
      <div className="absolute grid grid-cols-3 gap-6" style={{ left: 0, top: 0, width: 1440 }}>
        {RECAP.map((r) => {
          const t = TONE[r.tone];
          return (
            <div key={r.title} className={cn('card flex items-center gap-4 border-l-[8px] px-5', t.border)} style={{ height: RECAP_H }}>
              <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                <r.icon size={30} />
              </span>
              <div>
                <div className="text-[28px] font-bold leading-tight">{r.title}</div>
                <div className="text-[21px] leading-snug text-text-2">{r.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      {TODO.map((it, i) => {
        const t = TONE[it.tone];
        return (
          <Reveal
            key={it.title}
            show={step >= i + 1}
            from="up"
            className="absolute"
            style={{ left: (i % 2) * (TODO_W + 24), top: TODO_TOP + Math.floor(i / 2) * (TODO_H + 20), width: TODO_W }}
          >
            <div className={cn('card flex items-center gap-6 border-t-[6px] px-7 transition-shadow duration-300', t.border, step === i + 1 && t.ring)} style={{ height: TODO_H }}>
              <span className={cn('flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                <it.icon size={40} />
              </span>
              <div>
                <div className="text-[32px] font-bold leading-tight">{it.title}</div>
                <div className="mt-1 text-[23px] leading-snug text-text-2">{it.text}</div>
              </div>
            </div>
          </Reveal>
        );
      })}

      <StepCaption step={step} tone={cur?.tone ?? 'accent'} captions={['Что с этим делать: четыре шага на ближайшие недели', ...TODO.map((t) => t.caption)]} />
    </SlideLayout>
  );
}
