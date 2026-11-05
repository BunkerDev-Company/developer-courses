'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Briefcase, ClipboardCheck, Handshake, MessagesSquare, RefreshCcw, Target, UsersRound, Gauge, Trophy } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Цикл оценки раз в полгода. Шаг 0 — подпись цикла, шаги 1–5 — по этапу,
 * шаг 6 — что на самом деле смотрят при повышении.
 */

interface Stage {
  title: string;
  text: string;
  icon: LucideIcon;
  tone: Tone;
  caption: string;
}

const STAGES: Stage[] = [
  { title: 'Цели', text: 'с тимлидом договариваетесь, чего достичь', icon: Target, tone: 'ctrl', caption: 'В начале периода договариваемся о целях' },
  { title: 'Работа и 1:1', text: 'регулярно сверяете, идёте ли к цели', icon: Briefcase, tone: 'prisma', caption: 'В течение полугода: работа и встречи один на один' },
  { title: 'Самооценка', text: 'вы пишете, что получилось, а что нет', icon: ClipboardCheck, tone: 'logic', caption: 'Перед итогами вы сами оцениваете свою работу' },
  { title: 'Отзывы коллег', text: 'ментор и соседи по задачам дают обратную связь', icon: MessagesSquare, tone: 'warning', caption: 'Коллеги пишут, как с вами работалось' },
  { title: 'Решение', text: 'повышение, прибавка или план, что подтянуть', icon: Handshake, tone: 'success', caption: 'Тимлид и HR принимают решение и обсуждают его с вами' },
];

const CRITERIA: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
  { icon: Gauge, title: 'Самостоятельность', text: 'берёт больше и без подсказок', tone: 'logic' },
  { icon: Trophy, title: 'Результат', text: 'доводит задачи до релиза', tone: 'success' },
  { icon: UsersRound, title: 'Влияние', text: 'помогает всей команде', tone: 'git' },
];

const W = 264;
const G = 30;
const CARD_TOP = 86;
const CARD_H = 250;
const CRIT_TOP = 372;
const CRIT_H = 160;

export function ReviewSlide({ step }: SlideProps) {
  const cur = STAGES[step - 1];
  const criteria = step >= STAGES.length + 1;
  return (
    <SlideLayout section="growth" title="Как растёт грейд: ревью">
      <div className={cn('absolute flex items-center gap-4 rounded-2xl border-2 px-6', TONE.git.soft, TONE.git.borderSoft)} style={{ left: 0, top: 0, width: 1440, height: 62 }}>
        <RefreshCcw size={28} className="text-git" />
        <span className="text-[26px] font-bold text-git">Ревью</span>
        <span className="text-[24px] text-text-2">повторяется раз в полгода или в год — в каждой компании по-своему</span>
      </div>

      {STAGES.map((s, i) => {
        const t = TONE[s.tone];
        const active = step === i + 1;
        return (
          <Reveal key={s.title} show={step >= i + 1} from="up" className="absolute" style={{ left: i * (W + G), top: CARD_TOP, width: W }}>
            <div className={cn('card flex flex-col gap-3 border-t-[6px] p-5 transition-shadow duration-300', t.border, active && t.ring)} style={{ height: CARD_H }}>
              <div className="flex items-center justify-between">
                <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', t.soft, t.text)}>
                  <s.icon size={30} />
                </span>
                <span className="text-[22px] font-bold text-muted">{i + 1}</span>
              </div>
              <div className="text-[28px] font-bold leading-tight">{s.title}</div>
              <div className="text-[22px] leading-snug text-text-2">{s.text}</div>
            </div>
          </Reveal>
        );
      })}
      {STAGES.slice(1).map((s, i) => (
        <Reveal key={s.title} show={step >= i + 2} from="none" className="absolute" style={{ left: (i + 1) * (W + G) - G / 2 - 13, top: CARD_TOP + CARD_H / 2 - 13 }}>
          <ArrowRight size={26} className="text-muted" />
        </Reveal>
      ))}

      <div className="absolute" style={{ left: 0, top: CRIT_TOP, width: 1440 }}>
        <Reveal show={criteria} from="up">
          <div className="mb-3 text-[24px] font-semibold text-text-2">Повышают не за стаж, а за три вещи:</div>
        </Reveal>
        <div className="grid grid-cols-3 gap-6">
          {CRITERIA.map((c, i) => {
            const t = TONE[c.tone];
            return (
              <Reveal key={c.title} show={criteria} from="up" delay={0.1 + i * 0.12}>
                <div className={cn('card flex items-center gap-4 border-l-[8px] px-5', t.border)} style={{ height: CRIT_H - 50 }}>
                  <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                    <c.icon size={30} />
                  </span>
                  <div>
                    <div className="text-[27px] font-bold leading-tight">{c.title}</div>
                    <div className="text-[21px] leading-snug text-text-2">{c.text}</div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <StepCaption
        step={step}
        tone={criteria ? 'git' : (cur?.tone ?? 'git')}
        captions={['Рост по ступеням проверяют регулярно: раз в полгода', ...STAGES.map((s) => s.caption), 'Ревью смотрит на сделанное и на то, как вы растёте']}
      />
    </SlideLayout>
  );
}
