'use client';

import type { LucideIcon } from 'lucide-react';
import { CalendarCheck, CalendarDays, Clock, Coffee, Flag, Package, Presentation, RefreshCcw, Timer, Users } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';

/**
 * Календарь двухнедельного спринта. Шаг 0 — сам спринт, дальше по встрече на шаг:
 * 1 планнинг, 2 дейли, 3 демо, 4 ретро, 5 один на один с тимлидом.
 */

type MeetKey = 'planning' | 'daily' | 'demo' | 'retro' | 'oneOnOne';

interface Info {
  name: string;
  /** Как называют в разговоре. */
  slang: string;
  icon: LucideIcon;
  tone: Tone;
  when: string;
  length: string;
  who: string;
  why: string;
  result: string;
  caption: string;
}

const SPRINT: Info = {
  name: 'Спринт',
  slang: 'от 1 до 4 недель',
  icon: CalendarDays,
  tone: 'git',
  when: 'спринт за спринтом',
  length: 'чаще всего 2 недели',
  who: 'вся команда',
  why: 'короткий отрезок с общей целью. В конце — готовый кусок продукта',
  result: 'цель спринта',
  caption: 'Работа идёт спринтами — обычно по две недели',
};

const MEETS: Record<MeetKey, Info & { step: number; short: string }> = {
  planning: {
    step: 1,
    short: 'планнинг',
    name: 'Планирование',
    slang: 'планнинг',
    icon: CalendarCheck,
    tone: 'ctrl',
    when: 'первый день спринта',
    length: '1–2 часа',
    who: 'вся команда',
    why: 'выбрать задачи из бэклога и оценить, сколько они займут',
    result: 'план на спринт',
    caption: 'Планнинг: в начале спринта решаем, что берём в работу',
  },
  daily: {
    step: 2,
    short: 'дейли',
    name: 'Ежедневная встреча',
    slang: 'дейли, стендап',
    icon: Timer,
    tone: 'prisma',
    when: 'каждый день в одно время',
    length: '15 минут',
    who: 'вся команда',
    why: 'кто что делает и что кому мешает',
    result: 'проблемы видны сразу',
    caption: 'Дейли: каждый день на 15 минут сверяемся',
  },
  demo: {
    step: 3,
    short: 'демо',
    name: 'Демо',
    slang: 'ревью спринта',
    icon: Presentation,
    tone: 'logic',
    when: 'последний день спринта',
    length: 'около часа',
    who: 'команда, продакт, заказчики',
    why: 'показать вживую, что сделали за спринт',
    result: 'обратная связь',
    caption: 'Демо: в конце показываем, что сделали',
  },
  retro: {
    step: 4,
    short: 'ретро',
    name: 'Ретроспектива',
    slang: 'ретро',
    icon: RefreshCcw,
    tone: 'git',
    when: 'после демо',
    length: 'около часа',
    who: 'только команда',
    why: 'что было хорошо, что плохо, что поменяем',
    result: '2–3 улучшения',
    caption: 'Ретро: обсуждаем не задачи, а то, КАК работали',
  },
  oneOnOne: {
    step: 5,
    short: '1:1',
    name: 'Один на один',
    slang: '1:1, ван-ту-ван',
    icon: Coffee,
    tone: 'guard',
    when: 'раз в 1–2 недели',
    length: '30 минут',
    who: 'вы и тимлид',
    why: 'разговор о вас: как дела, что получается, куда расти',
    result: 'план развития',
    caption: '1:1 — личная встреча с тимлидом. Разговор о вас',
  },
};

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

/** События по дням спринта (0–9), по времени сверху вниз. */
const CALENDAR: { time: string; meet: MeetKey }[][] = Array.from({ length: 10 }, (_, d) => {
  const day: { time: string; meet: MeetKey }[] = [{ time: '10:30', meet: 'daily' }];
  if (d === 0) day.push({ time: '11:00', meet: 'planning' });
  if (d === 3) day.push({ time: '15:00', meet: 'oneOnOne' });
  if (d === 9) day.push({ time: '15:00', meet: 'demo' }, { time: '16:30', meet: 'retro' });
  return day;
});

const CELL_W = 133;
const dayX = (d: number) => d * (CELL_W + 10) + (d >= 5 ? 20 : 0);
const BAR_H = 46;
const CAL_TOP = 58;
const CAL_H = 214;
const PANEL_TOP = 296;
const PANEL_H = 240;

export function SprintSlide({ step }: SlideProps) {
  const info = step === 0 ? SPRINT : Object.values(MEETS).find((m) => m.step === step) ?? SPRINT;

  return (
    <SlideLayout section="meetings" title="Ритм команды: спринт и встречи">
      {/* Полоса спринта */}
      <div
        className={cn(
          'absolute flex items-center gap-3 rounded-xl border-2 px-5 transition-[box-shadow] duration-300',
          TONE.git.soft,
          TONE.git.borderSoft,
          step === 0 && TONE.git.ring,
        )}
        style={{ left: 0, top: 0, width: 1440, height: BAR_H }}
      >
        <Flag size={22} className="text-git" />
        <span className="text-[22px] font-bold text-git">Спринт 14</span>
        <span className="text-[21px] text-text-2">· 2 недели · цель: промокоды в корзине</span>
      </div>

      {/* Дни */}
      {CALENDAR.map((events, d) => (
        <div key={d} className="card absolute flex flex-col gap-1.5 p-2" style={{ left: dayX(d), top: CAL_TOP, width: CELL_W, height: CAL_H }}>
          <span className="px-1 text-[18px] font-bold text-text-2">{DAYS[d % 5]}</span>
          {events.map((e) => {
            const m = MEETS[e.meet];
            const t = TONE[m.tone];
            return (
              <Reveal key={e.meet} show={step >= m.step} from="scale" delay={e.meet === 'daily' ? d * 0.05 : 0}>
                <div
                  className={cn(
                    'rounded-lg border-2 px-2 py-1 transition-[box-shadow] duration-300',
                    t.soft,
                    t.borderSoft,
                    step === m.step && t.ring,
                  )}
                >
                  <div className="font-mono text-[15px] leading-tight text-text-2">{e.time}</div>
                  <div className={cn('text-[18px] font-bold leading-tight', t.text)}>{m.short}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      ))}

      {/* Что это за встреча */}
      <div className="absolute" style={{ left: 0, top: PANEL_TOP, width: 1440, height: PANEL_H }}>
        <Swap k={step} className="h-full">
          <MeetCard info={info} />
        </Swap>
      </div>

      <StepCaption step={step} tone={info.tone} captions={[SPRINT.caption, ...Object.values(MEETS).map((m) => m.caption)]} />
    </SlideLayout>
  );
}

function MeetCard({ info }: { info: Info }) {
  const t = TONE[info.tone];
  return (
    <div className={cn('card flex items-stretch gap-8 border-l-[8px] px-8 py-6', t.border)} style={{ height: PANEL_H }}>
      <div className="flex w-[400px] shrink-0 items-center gap-5">
        <span className={cn('flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
          <info.icon size={42} />
        </span>
        <div>
          <div className="text-[34px] font-bold leading-tight">{info.name}</div>
          <div className={cn('mt-1 text-[22px] font-semibold', t.text)}>{info.slang}</div>
        </div>
      </div>

      <div className="flex w-[380px] shrink-0 flex-col justify-center gap-3 border-l-2 border-border pl-8">
        <Meta icon={Clock}>{info.when}</Meta>
        <Meta icon={Timer}>{info.length}</Meta>
        <Meta icon={Users}>{info.who}</Meta>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 border-l-2 border-border pl-8">
        <div className="text-[26px] font-semibold leading-snug">{info.why}</div>
        <div className="flex items-center gap-3 text-[20px] text-text-2">
          <Package size={22} className="text-muted" /> итог:
          <Pill tone={info.tone}>{info.result}</Pill>
        </div>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[23px]">
      <Icon size={24} className="shrink-0 text-muted" />
      {children}
    </div>
  );
}
