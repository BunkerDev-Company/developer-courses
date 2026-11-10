'use client';

import { motion } from 'framer-motion';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Бёрндаун спринта на 40 поинтов, 10 рабочих дней.
 * 0 идеальная линия → 1 первые 4 дня по плану → 2 три дня без прогресса → 3 догнали и успели.
 */

const TOTAL = 40;
const DAYS = 10;
/** Сколько поинтов осталось к концу каждого дня (0 — старт). */
const LEFT = [40, 40, 36, 31, 27, 27, 27, 26, 16, 8, 0];
/** До какого дня видна фактическая линия на шаге. */
const SHOWN = [0, 4, 7, 10];

const PX0 = 76;
const PY0 = 56;
const PW = 860;
const PH = 380;
const x = (d: number) => PX0 + (d / DAYS) * PW;
const y = (p: number) => PY0 + PH * (1 - p / TOTAL);

const PANELS: { title: string; text: string; tone: Tone }[] = [
  { title: 'Сколько работы осталось', text: 'На старте спринта — 40 поинтов. Пунктир — идеальный темп: минус 4 в день.', tone: 'ctrl' },
  { title: 'Идём по плану', text: 'Линия держится у пунктира — команда успевает.', tone: 'success' },
  { title: 'Выше пунктира — отстаём', text: 'Три дня без прогресса: задача застряла. Это видно на дейли — Анна помогла разобраться.', tone: 'danger' },
  { title: 'Успели', text: 'Скорость команды — 40 поинтов за спринт. Примерно столько и берут в следующий.', tone: 'success' },
];

export function BurndownSlide({ step }: SlideProps) {
  const shownDay = SHOWN[Math.min(step, SHOWN.length - 1)];
  const actual = LEFT.map((p, d) => `${d === 0 ? 'M' : 'L'} ${x(d)} ${y(p)}`).join(' ');
  const panel = PANELS[Math.min(step, PANELS.length - 1)];

  return (
    <SlideLayout section="scrum" title="Бёрндаун: успеваем ли мы">
      <svg className="absolute left-0 top-0 overflow-visible" width={980} height={500}>
        <defs>
          <clipPath id="burn-clip">
            <motion.rect
              x={0}
              y={0}
              height={500}
              initial={false}
              animate={{ width: shownDay === 0 ? 0 : x(shownDay) + 8 }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </clipPath>
        </defs>

        {/* Легенда */}
        <g className="text-[19px]">
          <line x1={PX0} y1={18} x2={PX0 + 44} y2={18} strokeWidth={3} strokeDasharray="8 7" className="stroke-muted" />
          <text x={PX0 + 56} y={25} className="fill-text-2">идеальный темп</text>
          <line x1={PX0 + 250} y1={18} x2={PX0 + 294} y2={18} strokeWidth={4} className="stroke-ctrl" />
          <text x={PX0 + 306} y={25} className="fill-text-2">осталось работы, поинты</text>
        </g>

        {/* Отставание */}
        <motion.g initial={false} animate={{ opacity: step === 2 ? 1 : step > 2 ? 0.35 : 0 }} transition={{ duration: 0.4, ease: EASE }}>
          <rect x={x(4)} y={PY0} width={x(7) - x(4)} height={PH} className="fill-danger/10" />
          <text x={(x(4) + x(7)) / 2} y={PY0 + 30} textAnchor="middle" className="fill-danger text-[19px] font-semibold">
            застряли на 3 дня
          </text>
        </motion.g>

        {/* Сетка и оси */}
        {[0, 10, 20, 30, 40].map((p) => (
          <g key={p}>
            <line x1={PX0} y1={y(p)} x2={PX0 + PW} y2={y(p)} strokeWidth={1.5} className="stroke-border" />
            <text x={PX0 - 14} y={y(p) + 6} textAnchor="end" className="fill-muted text-[18px]">
              {p}
            </text>
          </g>
        ))}
        {Array.from({ length: DAYS + 1 }, (_, d) => (
          <text key={d} x={x(d)} y={PY0 + PH + 30} textAnchor="middle" className="fill-muted text-[18px]">
            {d === 0 ? 'старт' : d}
          </text>
        ))}
        <text x={PX0 + PW} y={PY0 + PH + 58} textAnchor="end" className="fill-muted text-[17px]">
          дни спринта
        </text>

        {/* Идеальный темп */}
        <line x1={x(0)} y1={y(TOTAL)} x2={x(DAYS)} y2={y(0)} strokeWidth={3} strokeDasharray="8 7" className="stroke-muted" />

        {/* Факт */}
        <g clipPath="url(#burn-clip)">
          <path d={actual} fill="none" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" className="stroke-ctrl" />
          {LEFT.map((p, d) => (
            <circle key={d} cx={x(d)} cy={y(p)} r={6} strokeWidth={3} className="fill-surface stroke-ctrl" />
          ))}
        </g>
      </svg>

      {/* Пояснение */}
      <div className="absolute" style={{ left: 1010, top: 56, width: 430 }}>
        <Swap k={step}>
          <div className={cn('card border-l-[8px] px-6 py-6', TONE[panel.tone].border)}>
            <div className="text-[30px] font-bold leading-tight">{panel.title}</div>
            <div className="mt-3 text-[23px] leading-snug text-text-2">{panel.text}</div>
          </div>
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={panel.tone}
        captions={[
          'Бёрндаун — сколько работы осталось до конца спринта',
          'Первые дни — по плану',
          'Плоский участок — сигнал: что-то застряло',
          'Скорость прошлых спринтов помогает не набрать лишнего',
        ]}
      />
    </SlideLayout>
  );
}
