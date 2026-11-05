'use client';

import type { LucideIcon } from 'lucide-react';
import { Building2, CalendarDays, Check, GraduationCap, ListChecks, Users } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаг 0 — три факта о стажировке, шаг 1 — что получаете вы, шаг 2 — что получает компания. */

const FACTS: { icon: LucideIcon; big: string; text: string }[] = [
  { icon: CalendarDays, big: '2–3 месяца', text: 'обычный срок' },
  { icon: Users, big: 'Наставник', text: 'смотрит ваш код и отвечает на вопросы' },
  { icon: ListChecks, big: 'Настоящие задачи', text: 'попроще, но для живого продукта' },
];

interface Side {
  title: string;
  icon: LucideIcon;
  tone: Tone;
  items: string[];
}

const YOU: Side = {
  title: 'Вы получаете',
  icon: GraduationCap,
  tone: 'warning',
  items: ['опыт, который можно вписать в резюме', 'ментора, который проверяет код', 'шанс остаться в команде'],
};

const COMPANY: Side = {
  title: 'Компания получает',
  icon: Building2,
  tone: 'git',
  items: ['будущего сотрудника, которого уже знает', 'свежий взгляд на продукт', 'проверку «как человек учится»'],
};

const FACT_W = 464;
const FACT_H = 160;
const SIDE_TOP = 190;
const SIDE_W = 708;
const SIDE_H = 330;

export function InternSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="internship" title="Что такое стажировка">
      {FACTS.map((f, i) => (
        <Reveal key={f.big} from="up" delay={i * 0.12} className="absolute" style={{ left: i * (FACT_W + 24), top: 0, width: FACT_W }}>
          <div className={cn('card flex items-center gap-5 border-l-[8px] px-6', TONE.warning.border)} style={{ height: FACT_H }}>
            <span className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl', TONE.warning.soft, TONE.warning.text)}>
              <f.icon size={34} />
            </span>
            <div>
              <div className="text-[32px] font-bold leading-tight">{f.big}</div>
              <div className="mt-1 text-[22px] leading-snug text-text-2">{f.text}</div>
            </div>
          </div>
        </Reveal>
      ))}

      {[YOU, COMPANY].map((s, i) => {
        const t = TONE[s.tone];
        const active = step === i + 1;
        return (
          <Reveal key={s.title} show={step >= i + 1} from={i === 0 ? 'left' : 'right'} className="absolute" style={{ left: i * (SIDE_W + 24), top: SIDE_TOP, width: SIDE_W }}>
            <div className={cn('card flex flex-col gap-5 border-t-[6px] p-7 transition-shadow duration-300', t.border, active && t.ring)} style={{ height: SIDE_H }}>
              <div className="flex items-center gap-4">
                <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', t.soft, t.text)}>
                  <s.icon size={30} />
                </span>
                <span className="text-[34px] font-bold">{s.title}</span>
              </div>
              <div className="flex flex-col gap-4">
                {s.items.map((it) => (
                  <div key={it} className="flex items-start gap-3 text-[26px] leading-snug">
                    <Check size={30} strokeWidth={3} className={cn('mt-0.5 shrink-0', t.text)} />
                    {it}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        );
      })}

      <StepCaption
        step={step}
        tone={step === 2 ? 'git' : 'warning'}
        captions={['Стажировка — вход в профессию с поддержкой', 'Для вас это учёба на живом продукте', 'Для компании — способ найти своих людей']}
      />
    </SlideLayout>
  );
}
