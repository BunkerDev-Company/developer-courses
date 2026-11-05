'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Flag, GitPullRequest, KeyRound, ListChecks, MessagesSquare, Rocket, UserRoundCheck, Users } from 'lucide-react';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE } from '../it-company/data';
import { Avatar } from '../it-company/parts';
import { OverviewPanel, StagePanel, type Person } from './parts';

/** Шаг 0 — три месяца целиком, шаги 1–4 — по этапу. «Вы» движется вдоль полосы. */

interface Phase {
  time: string;
  title: string;
  icon: LucideIcon;
  tone: Tone;
  people: Person[];
  doing: string;
  result: string;
  help: string;
  caption: string;
}

const PHASES: Phase[] = [
  {
    time: 'Неделя 1',
    title: 'Онбординг',
    icon: KeyRound,
    tone: 'prisma',
    people: [PEOPLE.hr, PEOPLE.dev],
    doing: 'доступы, ноутбук, запуск проекта, знакомство с командой',
    result: 'проект запускается у вас локально',
    help: 'Катя оформляет доступы, Макс показывает проект',
    caption: 'Неделя 1: доступы, окружение и знакомство с командой',
  },
  {
    time: 'Недели 2–4',
    title: 'Первая задача',
    icon: GitPullRequest,
    tone: 'logic',
    people: [PEOPLE.dev],
    doing: 'маленький баг или правка текста и ваш первый ПР',
    result: 'первое изменение влито в основную ветку',
    help: 'Макс смотрит код и отвечает на вопросы',
    caption: 'Недели 2–4: небольшая задача и первый пул-реквест',
  },
  {
    time: 'Месяц 2',
    title: 'Самостоятельность',
    icon: Rocket,
    tone: 'ctrl',
    people: [PEOPLE.lead],
    doing: 'кусок настоящей задачи, например PROMO-12',
    result: 'задачи без подсказок на каждом шаге',
    help: 'Анна выбирает задачи, Макс остаётся ментором',
    caption: 'Месяц 2: задачи побольше, подсказок меньше',
  },
  {
    time: 'Месяц 3',
    title: 'Итоги',
    icon: MessagesSquare,
    tone: 'success',
    people: [PEOPLE.lead, PEOPLE.hr],
    doing: 'разговор: что получилось, что подтянуть, что дальше',
    result: 'оффер, продление или обратная связь',
    help: 'Анна даёт обратную связь, Катя оформляет оффер',
    caption: 'Месяц 3: подводим итоги вместе с тимлидом и HR',
  },
];

/** Ширина сегментов (с зазором 10): сумма 1410 + 3×10 = 1440. */
const WIDTHS = [210, 380, 410, 410];
const LEFTS = WIDTHS.map((_, i) => WIDTHS.slice(0, i).reduce((a, w) => a + w + 10, 0));
const BAR_H = 120;
const PANEL_TOP = 184;
const PANEL_H = 366;

export function TimelineSlide({ step }: SlideProps) {
  const cur = PHASES[step - 1];
  const marker = LEFTS[Math.max(step - 1, 0)];
  return (
    <SlideLayout section="internship" title="Три месяца стажёра">
      {PHASES.map((p, i) => {
        const t = TONE[p.tone];
        const active = step === i + 1;
        return (
          <div
            key={p.title}
            className={cn(
              'card absolute flex flex-col justify-center gap-1 border-t-[6px] px-5 transition-[box-shadow,opacity] duration-300',
              t.border,
              active && t.ring,
              step > 0 && !active && 'opacity-50',
            )}
            style={{ left: LEFTS[i], top: 0, width: WIDTHS[i], height: BAR_H }}
          >
            <div className={cn('text-[20px] font-bold', t.text)}>{p.time}</div>
            <div className="text-[28px] font-bold leading-tight">{p.title}</div>
          </div>
        );
      })}

      <motion.div
        className="absolute flex items-center gap-3"
        style={{ top: BAR_H + 10 }}
        initial={false}
        animate={{ left: marker }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Avatar name={PEOPLE.you.name} role={PEOPLE.you.role} size={44} />
        {step === 0 && <span className="text-[22px] font-semibold text-text-2">вы здесь, в начале пути</span>}
      </motion.div>

      <div className="absolute" style={{ left: 0, top: PANEL_TOP, width: 1440, height: PANEL_H }}>
        <Swap k={step} className="h-full">
          {cur ? (
            <StagePanel
              icon={cur.icon}
              title={cur.title}
              sub={cur.time}
              tone={cur.tone}
              people={cur.people}
              height={PANEL_H}
              rows={[
                { icon: ListChecks, label: 'что делаете', text: cur.doing },
                { icon: Flag, label: 'итог этапа', text: cur.result },
                { icon: UserRoundCheck, label: 'как помогают', text: cur.help },
              ]}
            />
          ) : (
            <OverviewPanel
              icon={Users}
              tone="warning"
              title="Сначала вас учат, потом вы работаете сами"
              text="Первые три месяца делятся на четыре этапа. Всё это время рядом ментор и тимлид"
              height={PANEL_H}
            />
          )}
        </Swap>
      </div>

      <StepCaption step={step} tone={cur?.tone ?? 'warning'} captions={['Стажировка — это четыре этапа за три месяца', ...PHASES.map((p) => p.caption)]} />
    </SlideLayout>
  );
}
