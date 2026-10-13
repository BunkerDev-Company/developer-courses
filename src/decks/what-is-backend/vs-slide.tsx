'use client';

import type { LucideIcon } from 'lucide-react';
import { CodeXml, DatabaseZap, Eye, EyeOff, Monitor, MonitorSmartphone, Server, ServerCog, Snail } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаги 0–3: по строке сравнения на шаг. */

interface Side {
  icon: LucideIcon;
  text: string;
}

interface Row {
  label: string;
  front: Side;
  back: Side;
  caption: string;
}

const ROWS: Row[] = [
  {
    label: 'Где работает',
    front: { icon: Monitor, text: 'в браузере у каждого пользователя' },
    back: { icon: Server, text: 'на сервере компании — один на всех' },
    caption: 'Фронтенд — у пользователя, бэкенд — у нас на сервере',
  },
  {
    label: 'Что видит пользователь',
    front: { icon: Eye, text: 'всё: кнопки, страницы, анимации' },
    back: { icon: EyeOff, text: 'ничего — только результат' },
    caption: 'Фронтенд видно целиком, бэкенд не видно вообще',
  },
  {
    label: 'Чего боится',
    front: { icon: Snail, text: 'тормозящего, кривого интерфейса' },
    back: { icon: DatabaseZap, text: 'потерянных или чужих данных' },
    caption: 'Ошибка фронта — неудобно. Ошибка бэка — потеря денег и данных',
  },
  {
    label: 'Чем пишем',
    front: { icon: CodeXml, text: 'HTML, CSS, TypeScript · React, Next.js' },
    back: { icon: CodeXml, text: 'TypeScript · Node.js, NestJS · PostgreSQL' },
    caption: 'Язык один — TypeScript, а инструменты разные',
  },
];

const SIDE_W = 560;
const MID_X = 590;
const MID_W = 260;
const BACK_X = 880;
const ROW_TOP = 92;
const ROW_H = 100;
const ROW_GAP = 12;

export function VsSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Фронтенд vs бэкенд">
      {/* Шапка */}
      <Header tone="client" icon={MonitorSmartphone} title="Фронтенд" left={0} />
      <div className="absolute flex items-center justify-center" style={{ left: MID_X, top: 0, width: MID_W, height: 70 }}>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-text text-[24px] font-extrabold text-bg">VS</span>
      </div>
      <Header tone="logic" icon={ServerCog} title="Бэкенд" left={BACK_X} />

      {ROWS.map((r, i) => {
        const top = ROW_TOP + i * (ROW_H + ROW_GAP);
        const current = i === step;
        return (
          <Reveal key={r.label} show={step >= i} from="up">
            <Cell side={r.front} tone="client" active={current} style={{ left: 0, top }} />
            <div
              className={cn(
                'absolute flex items-center justify-center text-center text-[23px] font-semibold leading-tight transition-colors duration-300',
                current ? 'text-text' : 'text-text-2',
              )}
              style={{ left: MID_X, top, width: MID_W, height: ROW_H }}
            >
              {r.label}
            </div>
            <Cell side={r.back} tone="logic" active={current} style={{ left: BACK_X, top }} />
          </Reveal>
        );
      })}

      <StepCaption step={step} tone="success" captions={ROWS.map((r) => r.caption)} />
    </SlideLayout>
  );
}

function Header({ tone, icon: Icon, title, left }: { tone: Tone; icon: LucideIcon; title: string; left: number }) {
  const t = TONE[tone];
  return (
    <div className={cn('absolute flex items-center justify-center gap-4 rounded-2xl border-2', t.borderSoft, t.soft)} style={{ left, top: 0, width: SIDE_W, height: 70 }}>
      <Icon size={36} className={t.text} />
      <span className={cn('text-[34px] font-bold', t.text)}>{title}</span>
    </div>
  );
}

function Cell({ side, tone, active, style }: { side: Side; tone: Tone; active: boolean; style: React.CSSProperties }) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        'card absolute flex items-center gap-4 px-5 transition-[border-color,box-shadow] duration-300',
        active && cn(t.border, t.ring),
      )}
      style={{ ...style, width: SIDE_W, height: ROW_H }}
    >
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
        <side.icon size={26} />
      </div>
      <span className="text-[24px] leading-snug">{side.text}</span>
    </div>
  );
}
