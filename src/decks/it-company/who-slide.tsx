'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Target, X } from 'lucide-react';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { ROLES, type RoleKey } from './data';
import { RoleIcon } from './parts';

/** Шаги 0–3: по руководителю на шаг. Шаг 4: тимлид — главный человек для стажёра. */

interface Boss {
  role: RoleKey;
  title: string;
  sub: string;
  owns: string;
  goTo: string;
  notMine: string;
  caption: string;
}

const BOSSES: Boss[] = [
  {
    role: 'pm',
    title: 'Продакт',
    sub: 'продакт-менеджер',
    owns: 'что делаем и в каком порядке',
    goTo: 'непонятно, какая задача важнее',
    notMine: 'как писать код',
    caption: 'Продакт отвечает за ЧТО: какие задачи и в каком порядке',
  },
  {
    role: 'lead',
    title: 'Тимлид',
    sub: 'руководитель команды',
    owns: 'как делаем, кто что делает, рост людей',
    goTo: 'застряли, нужен совет или ревью',
    notMine: 'делать задачу за вас',
    caption: 'Тимлид — за КАК: решения, ревью, люди в команде',
  },
  {
    role: 'cto',
    title: 'CTO',
    sub: 'технический директор',
    owns: 'техника всей компании: стек, архитектура, найм',
    goTo: 'почти никогда — сначала к тимлиду',
    notMine: 'ревьюить каждую задачу',
    caption: 'CTO — за технику всей компании. Со стажёром видится редко',
  },
  {
    role: 'hr',
    title: 'HR',
    sub: 'эйчар',
    owns: 'люди: найм, адаптация, отпуска, обучение',
    goTo: 'договор, отпуск, больничный, конфликт',
    notMine: 'оценивать ваш код',
    caption: 'HR — за людей: найм, адаптацию, отпуска',
  },
];

const CARD_W = 342;
const GAP = 24;
const CARD_H = 530;

function Block({ label, icon: Icon, children, muted }: { label: string; icon: LucideIcon; children: React.ReactNode; muted?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[17px] font-semibold uppercase tracking-wider text-muted">
        <Icon size={18} strokeWidth={2.5} />
        {label}
      </div>
      <div className={cn('mt-1.5 text-[24px] font-semibold leading-snug', muted && 'font-normal text-text-2')}>{children}</div>
    </div>
  );
}

export function WhoSlide({ step }: SlideProps) {
  const focusLead = step >= BOSSES.length;
  return (
    <SlideLayout section="team" title="Продакт, тимлид, CTO, HR: кто за что">
      {BOSSES.map((b, i) => {
        const r = ROLES[b.role];
        const t = TONE[r.tone];
        const shown = step >= i;
        const active = focusLead ? b.role === 'lead' : i === step;
        return (
          <motion.div
            key={b.role}
            className="absolute"
            style={{ left: i * (CARD_W + GAP), top: 0, width: CARD_W }}
            initial={false}
            animate={{ opacity: !shown ? 0 : focusLead && !active ? 0.35 : 1, y: shown ? 0 : 28, scale: focusLead && active ? 1.03 : 1 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div
              className={cn('card flex flex-col gap-5 border-t-[6px] p-7 transition-shadow duration-300', t.border, active && t.ring)}
              style={{ height: CARD_H }}
            >
              <div className="flex items-center gap-4">
                <RoleIcon role={b.role} size={60} />
                <div>
                  <div className="text-[32px] font-bold leading-tight">{b.title}</div>
                  <div className="whitespace-nowrap text-[17px] text-text-2">{b.sub}</div>
                </div>
              </div>
              <Block label="отвечает за" icon={Target}>
                {b.owns}
              </Block>
              <Block label="идите к нему, если" icon={ArrowRight}>
                {b.goTo}
              </Block>
              <Block label="не его работа" icon={X} muted>
                {b.notMine}
              </Block>
            </div>
          </motion.div>
        );
      })}

      <StepCaption
        step={step}
        tone={focusLead ? 'git' : ROLES[BOSSES[step].role].tone}
        captions={[...BOSSES.map((b) => b.caption), 'Для стажёра главный человек — тимлид (или ментор)']}
      />
    </SlideLayout>
  );
}
