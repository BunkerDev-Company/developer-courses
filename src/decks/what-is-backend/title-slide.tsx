'use client';

import { motion } from 'framer-motion';
import { AlarmClock, ArrowDown, ArrowUp, Calculator, ChefHat, Database, Mail, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { EASE } from '@/lib/motion';
import type { SlideProps } from '@/types';

// Айсберг: над водой — фронтенд (видно), под водой — бэкенд (основная масса).
const W = 720;
const H = 800;
const WATER_Y = 300;
const TIP = '250,300 285,215 330,170 360,120 400,95 440,140 470,130 505,200 540,250 565,300';
const BODY = '220,300 160,380 110,470 95,560 150,650 260,720 400,745 530,710 625,620 650,500 615,390 585,300';

const HIDDEN_JOBS = [
  { icon: Database, label: 'данные', x: 250, y: 470 },
  { icon: ShieldCheck, label: 'проверки', x: 375, y: 470 },
  { icon: Calculator, label: 'расчёты', x: 500, y: 470 },
  { icon: Mail, label: 'письма', x: 310, y: 600 },
  { icon: AlarmClock, label: 'расписание', x: 440, y: 600 },
];

export function TitleSlide(_: SlideProps) {
  return (
    <div className="relative h-full">
      {/* Текст слева */}
      <div className="absolute flex flex-col justify-center" style={{ left: 100, top: 0, bottom: 40, width: 680 }}>
        <Reveal from="down">
          <div className="eyebrow text-accent">Основы веба</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-5 text-[96px] font-extrabold leading-[1.02] tracking-tight">
            Что такое
            <br />
            бэкенд
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-[36px] leading-snug text-text-2">невидимая часть приложения</p>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="mt-12 flex flex-wrap gap-4 text-[22px] font-semibold">
            <span className="flex items-center gap-2.5 rounded-2xl border-2 border-logic/30 bg-logic/10 px-4 py-2 text-logic">
              <ChefHat size={24} /> на примере ресторана
            </span>
            <span className="flex items-center gap-2.5 rounded-2xl border-2 border-client/30 bg-client/10 px-4 py-2 text-client">
              <ShoppingCart size={24} /> и интернет-магазина
            </span>
          </div>
        </Reveal>
      </div>

      {/* Айсберг справа */}
      <div className="absolute" style={{ left: 820, top: 60, width: W, height: H }}>
        <svg className="absolute inset-0 overflow-visible" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <motion.path
            d={`M 0 ${WATER_Y} H ${W} V ${H - 28} Q ${W} ${H} ${W - 28} ${H} H 28 Q 0 ${H} 0 ${H - 28} Z`}
            className="fill-db/[0.07]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
          <motion.polygon
            points={BODY}
            className="fill-logic/[0.12] stroke-logic/50"
            strokeWidth={3}
            strokeLinejoin="round"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
          />
          <motion.polygon
            points={TIP}
            className="fill-surface stroke-border-2"
            strokeWidth={3}
            strokeLinejoin="round"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          />
          <motion.line
            x1={0}
            y1={WATER_Y}
            x2={W}
            y2={WATER_Y}
            className="stroke-db/60"
            strokeWidth={3}
            strokeDasharray="14 10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          />
        </svg>

        {/* Подписи «видно / не видно» у линии воды */}
        <Reveal delay={0.5} className="absolute flex items-center gap-1.5 text-[18px] font-semibold text-muted" style={{ left: 16, top: WATER_Y - 38 }}>
          <ArrowUp size={18} /> видно
        </Reveal>
        <Reveal delay={0.5} className="absolute flex items-center gap-1.5 text-[18px] font-semibold text-db" style={{ left: 16, top: WATER_Y + 12 }}>
          <ArrowDown size={18} /> не видно
        </Reveal>

        {/* Верхушка — фронтенд */}
        <Reveal delay={0.5} className="absolute text-center" style={{ left: 300, top: 215, width: 220 }}>
          <div className="text-[28px] font-bold text-client">Фронтенд</div>
        </Reveal>

        {/* Подводная часть — бэкенд */}
        <Reveal delay={1.2} className="absolute text-center" style={{ left: 225, top: 345, width: 300 }}>
          <div className="text-[40px] font-extrabold text-logic">Бэкенд</div>
        </Reveal>
        {HIDDEN_JOBS.map((j, i) => (
          <Reveal
            key={j.label}
            from="scale"
            delay={1.4 + i * 0.12}
            className="absolute flex flex-col items-center gap-1.5"
            style={{ left: j.x - 70, top: j.y - 36, width: 140 }}
          >
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-surface text-logic shadow-card">
              <j.icon size={32} />
            </div>
            <span className="text-[19px] font-semibold text-text-2">{j.label}</span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
