'use client';

import { motion } from 'framer-motion';
import { Database, FileStack, FileCode2, Globe } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

// Координаты — в области контента (1440×644).
const ROW_Y = 194;
const CHAIN: { label: string; tone: Tone; x: number }[] = [
  { label: 'Guard', tone: 'guard', x: 300 },
  { label: 'Controller', tone: 'ctrl', x: 500 },
  { label: 'Handler', tone: 'logic', x: 700 },
  { label: 'Prisma', tone: 'prisma', x: 900 },
];
const PILL_W = 160;

// Точки маршрута «пакета» запроса: браузер → слои → база.
const ROUTE_X = [110, ...CHAIN.map((c) => c.x + PILL_W / 2), 1218];

export function MapSlide({ step }: SlideProps) {
  const mig = step === 1;
  const prisma = step === 2;
  const req = step === 3;

  return (
    <SlideLayout section="intro" title="Карта: три стрелки на сегодня">
      {/* Браузер */}
      <NodeBox
        tone="client"
        icon={Globe}
        title="Браузер"
        sub="Next.js"
        state={req ? 'active' : step > 0 ? 'dim' : 'idle'}
        className="absolute"
        style={{ left: 0, top: 150, width: 220 }}
      />

      {/* NestJS-приложение со слоями */}
      <motion.div
        initial={false}
        animate={{ opacity: mig ? 0.35 : 1 }}
        className="absolute rounded-3xl border-2 border-dashed border-border-2 bg-surface/50"
        style={{ left: 270, top: 90, width: 830, height: 210 }}
      >
        <span className="absolute left-6 top-4 text-[20px] font-semibold text-text-2">NestJS-бэкенд</span>
      </motion.div>
      {CHAIN.map((c) => {
        const t = TONE[c.tone];
        const on = req || (prisma && c.label === 'Prisma');
        return (
          <motion.div
            key={c.label}
            initial={false}
            animate={{ opacity: step === 0 || on ? 1 : 0.35, scale: on ? 1.05 : 1 }}
            className={cn(
              'absolute flex items-center justify-center rounded-2xl border-2 bg-surface text-[22px] font-semibold shadow-card',
              on ? cn(t.border, t.ring) : t.borderSoft,
              t.text,
            )}
            style={{ left: c.x, top: ROW_Y - 32, width: PILL_W, height: 64 }}
          >
            {c.label}
          </motion.div>
        );
      })}

      {/* База */}
      <NodeBox
        tone="db"
        icon={Database}
        title="PostgreSQL"
        sub="таблицы"
        state={step > 0 ? 'active' : 'idle'}
        className="absolute"
        style={{ left: 1170, top: 150, width: 270 }}
      />

      {/* Миграции и schema.prisma появляются со своими шагами */}
      <Reveal show={step >= 1} className="absolute" style={{ left: 1140, top: 420, width: 300 }}>
        <NodeBox tone="git" icon={FileStack} title="Миграции" sub="*.sql" state={mig ? 'active' : 'dim'} />
      </Reveal>
      <Reveal show={step >= 2} className="absolute" style={{ left: 740, top: 420, width: 320 }}>
        <NodeBox tone="prisma" icon={FileCode2} title="schema.prisma" sub="модели → типы" state={prisma ? 'active' : 'dim'} />
      </Reveal>

      {/* ① миграции → база */}
      <Arrow show={step >= 1} from={[1305, 418]} to={[1305, 246]} tone={mig ? 'git' : 'muted'} label="migrate:up" labelOffset={[0, 0]} flow={mig} />

      {/* ② база → schema.prisma → Prisma */}
      <Arrow show={step >= 2} from={[1200, 244]} to={[1066, 440]} curve={-30} tone={prisma ? 'prisma' : 'muted'} label="db pull" flow={prisma} />
      <Arrow show={step >= 2} from={[880, 418]} to={[960, 232]} curve={30} tone={prisma ? 'prisma' : 'muted'} label="generate" flow={prisma} delay={0.3} />

      {/* ③ запрос: стрелки между слоями */}
      <Arrow show from={[222, ROW_Y]} to={[296, ROW_Y]} tone={req ? 'ctrl' : 'muted'} width={3} />
      {CHAIN.slice(0, -1).map((c) => (
        <Arrow key={c.label} show from={[c.x + PILL_W + 2, ROW_Y]} to={[c.x + 200 - 4, ROW_Y]} tone={req ? 'ctrl' : 'muted'} width={3} />
      ))}
      <Arrow show from={[1062, ROW_Y]} to={[1166, ROW_Y]} tone={req ? 'ctrl' : 'muted'} width={3} />

      {/* Бегущий «пакет» запроса */}
      {req && (
        <motion.div
          className="absolute left-0 top-0 z-20 h-7 w-7 rounded-full bg-ctrl shadow-[0_0_0_8px_rgb(var(--c-ctrl)/0.25)]"
          initial={{ x: ROUTE_X[0] - 14, y: ROW_Y - 14, opacity: 0 }}
          animate={{ x: ROUTE_X.map((x) => x - 14), y: ROW_Y - 14, opacity: [0, 1, 1, 1, 1, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
        />
      )}

      <StepCaption
        step={step}
        tone={step === 1 ? 'git' : step === 2 ? 'prisma' : 'ctrl'}
        captions={[
          'Фронт → бэкенд → база. Сегодня разбираем, как это связано',
          '① Миграции — как меняется структура базы',
          '② Prisma — как код узнаёт про таблицы и говорит с базой',
          '③ Путь запроса — через какие слои проходит каждый запрос',
        ]}
      />
    </SlideLayout>
  );
}
