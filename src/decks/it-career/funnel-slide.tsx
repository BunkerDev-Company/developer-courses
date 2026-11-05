'use client';

import type { LucideIcon } from 'lucide-react';
import { BookOpen, ChevronRight, CodeXml, FileText, Flag, Handshake, Phone, Search, Users } from 'lucide-react';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE } from '../it-company/data';
import { OverviewPanel, StagePanel, type Person } from './parts';

/** Шаг 0 — пять этапов целиком, шаги 1–5 — по этапу: кто там, что проверяют, как подготовиться. */

interface Stage {
  title: string;
  short: string;
  icon: LucideIcon;
  tone: Tone;
  who: Person | null;
  checks: string;
  prepare: string;
  result: string;
  caption: string;
}

const STAGES: Stage[] = [
  {
    title: 'Резюме',
    short: 'отклик',
    icon: FileText,
    tone: 'accent',
    who: PEOPLE.hr,
    checks: 'стек, проекты, ссылка на GitHub',
    prepare: 'одна страница и свои проекты, а не «ответственный»',
    result: 'приглашение на звонок',
    caption: 'Резюме: HR решает, звать ли вас на разговор',
  },
  {
    title: 'Звонок HR',
    short: '20–30 минут',
    icon: Phone,
    tone: 'guard',
    who: PEOPLE.hr,
    checks: 'почему к нам, когда можете начать, сколько времени в неделю',
    prepare: 'узнайте о компании и подготовьте рассказ о себе на минуту',
    result: 'допуск к техническому этапу',
    caption: 'Звонок HR: знакомство и мотивация, без техники',
  },
  {
    title: 'Техническое интервью',
    short: 'с разработчиком',
    icon: CodeXml,
    tone: 'logic',
    who: PEOPLE.dev,
    checks: 'основы и то, как вы рассуждаете, когда не знаете ответ',
    prepare: 'повторите то, что написали в резюме: это и спросят',
    result: 'мнение разработчика: сможет ли учиться',
    caption: 'Техническое интервью: проверяют базу и ход мыслей',
  },
  {
    title: 'Встреча с тимлидом',
    short: 'знакомство с командой',
    icon: Users,
    tone: 'git',
    who: PEOPLE.lead,
    checks: 'подойдёте ли команде, интересно ли вам учиться',
    prepare: 'придумайте вопросы про команду и первые задачи',
    result: 'решение: берём',
    caption: 'Тимлид: берёт человека в свою команду — и учит',
  },
  {
    title: 'Оффер',
    short: 'предложение',
    icon: Handshake,
    tone: 'success',
    who: PEOPLE.hr,
    checks: 'срок, график, оплата, кто будет ментором',
    prepare: 'спросите всё, что неясно: до подписания, а не после',
    result: 'выходите на стажировку',
    caption: 'Оффер: условия стажировки. Неясное — уточняйте',
  },
];

const W = 268;
const G = 25;
const CARD_H = 200;
const PANEL_TOP = 224;
const PANEL_H = 330;

export function FunnelSlide({ step }: SlideProps) {
  const cur = STAGES[step - 1];
  return (
    <SlideLayout section="hiring" title="Путь к стажировке">
      {STAGES.map((s, i) => {
        const t = TONE[s.tone];
        const active = step === i + 1;
        return (
          <div key={s.title} className="absolute" style={{ left: i * (W + G), top: 0, width: W }}>
            <div
              className={cn(
                'card flex flex-col items-center gap-3 border-t-[6px] px-3 py-5 transition-[box-shadow,opacity] duration-300',
                t.border,
                active && t.ring,
                step > 0 && !active && 'opacity-50',
              )}
              style={{ height: CARD_H }}
            >
              <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', t.soft, t.text)}>
                <s.icon size={30} />
              </span>
              <div className="text-center text-[25px] font-bold leading-tight">{s.title}</div>
              <div className="mt-auto text-[19px] text-text-2">{s.short}</div>
            </div>
          </div>
        );
      })}
      {STAGES.slice(1).map((s, i) => (
        <ChevronRight key={s.title} size={24} className="absolute text-muted" style={{ left: (i + 1) * (W + G) - G / 2 - 12, top: CARD_H / 2 - 12 }} />
      ))}

      <div className="absolute" style={{ left: 0, top: PANEL_TOP, width: 1440, height: PANEL_H }}>
        <Swap k={step} className="h-full">
          {cur ? (
            <StagePanel
              icon={cur.icon}
              title={cur.title}
              sub={cur.short}
              tone={cur.tone}
              people={cur.who ? [cur.who] : []}
              height={PANEL_H}
              rows={[
                { icon: Search, label: 'что проверяют', text: cur.checks },
                { icon: BookOpen, label: 'как подготовиться', text: cur.prepare },
                { icon: Flag, label: 'итог этапа', text: cur.result },
              ]}
            />
          ) : (
            <OverviewPanel
              icon={Users}
              tone="guard"
              title="Пять этапов, и на каждом другой человек"
              text="Отказ на этапе — не приговор: можно попросить обратную связь и прийти снова"
              height={PANEL_H}
            />
          )}
        </Swap>
      </div>

      <StepCaption step={step} tone={cur?.tone ?? 'guard'} captions={['Как попадают на стажировку: пять этапов', ...STAGES.map((s) => s.caption)]} />
    </SlideLayout>
  );
}
