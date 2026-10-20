'use client';

import { motion } from 'framer-motion';
import { Database, FileCode2, FileStack, Gamepad2 } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { NodeBox } from '@/components/ui/node-box';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги:
 * 0 — игра в браузере ↔ NestJS ↔ PostgreSQL, два канала: REST и WebSocket
 * 1 — миграции: откуда в базе таблицы
 * 2 — Prisma: откуда код знает про таблицы
 * 3 — REST: лавка, кошелёк — обычные запросы по слоям
 * 4 — WebSocket: бой идёт в реальном времени, считает сервер
 */

const ZONE = { left: 280, top: 0, width: 820, height: 480 };
const REST_Y = 160;
const WS_Y = 380;
const PILL_H = 64;

const REST: { label: string; tone: Tone; x: number; w: number }[] = [
  { label: 'JwtAuthGuard', tone: 'guard', x: 310, w: 180 },
  { label: 'ShopController', tone: 'ctrl', x: 510, w: 190 },
  { label: 'CommandBus', tone: 'logic', x: 720, w: 160 },
  { label: 'Handler', tone: 'logic', x: 900, w: 170 },
];

const WS: { label: string; tone: Tone; x: number; w: number }[] = [
  { label: 'GameGateway', tone: 'ctrl', x: 310, w: 190 },
  { label: 'RoomsService · Sim 20 Гц', tone: 'logic', x: 560, w: 360 },
];

function Pill({ label, tone, x, w, y, on, dim }: { label: string; tone: Tone; x: number; w: number; y: number; on: boolean; dim: boolean }) {
  const t = TONE[tone];
  return (
    <motion.div
      initial={false}
      animate={{ opacity: dim ? 0.3 : 1, scale: on ? 1.05 : 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn(
        'absolute flex items-center justify-center rounded-2xl border-2 bg-surface font-mono text-[20px] font-semibold shadow-card',
        on ? cn(t.border, t.ring) : t.borderSoft,
        t.text,
      )}
      style={{ left: x, top: y - PILL_H / 2, width: w, height: PILL_H }}
    >
      {label}
    </motion.div>
  );
}

export function DungeonMapSlide({ step }: SlideProps) {
  const mig = step === 1;
  const prisma = step === 2;
  const rest = step === 3;
  const ws = step === 4;
  const lanesDim = mig || prisma;

  return (
    <SlideLayout section="intro" title="Карта: игра изнутри">
      {/* Игра в браузере */}
      <NodeBox
        tone="client"
        icon={Gamepad2}
        title="Игра"
        sub="canvas"
        state={rest || ws || step === 0 ? 'active' : 'dim'}
        className="absolute"
        style={{ left: 0, top: 230, width: 250 }}
      />

      {/* NestJS */}
      <motion.div
        initial={false}
        animate={{ opacity: mig ? 0.35 : 1 }}
        className="absolute rounded-3xl border-2 border-dashed border-border-2 bg-surface/50"
        style={ZONE}
      >
        <span className="absolute left-6 top-4 text-[20px] font-semibold text-text-2">NestJS · dungeon-backend</span>
        <span className="absolute left-6 font-mono text-[17px] font-semibold text-ctrl" style={{ top: REST_Y - ZONE.top - 70 }}>
          REST · /api/v1
        </span>
        <span className="absolute left-6 font-mono text-[17px] font-semibold text-logic" style={{ top: WS_Y - ZONE.top - 70 }}>
          WebSocket · /game
        </span>
      </motion.div>
      {REST.map((p) => (
        <Pill key={p.label} {...p} y={REST_Y} on={rest || (prisma && p.label === 'Handler')} dim={ws || (lanesDim && !(prisma && p.label === 'Handler'))} />
      ))}
      {REST.slice(0, -1).map((p, i) => (
        <Arrow key={p.label} from={[p.x + p.w + 3, REST_Y]} to={[REST[i + 1].x - 5, REST_Y]} tone={rest ? 'ctrl' : 'muted'} width={3} />
      ))}
      {WS.map((p) => (
        <Pill key={p.label} {...p} y={WS_Y} on={ws} dim={rest || lanesDim} />
      ))}
      <Arrow from={[WS[0].x + WS[0].w + 3, WS_Y]} to={[WS[1].x - 5, WS_Y]} tone={ws ? 'logic' : 'muted'} width={3} />

      {/* Каналы от игры */}
      <Arrow from={[252, 262]} to={[REST[0].x - 6, REST_Y]} curve={-30} tone={rest ? 'ctrl' : 'muted'} flow={rest} width={3} />
      <Arrow from={[252, 300]} to={[WS[0].x - 6, WS_Y]} curve={30} tone={ws ? 'logic' : 'muted'} flow={ws} width={3} />

      {/* Шаг 4: что идёт по сокету */}
      <motion.div
        initial={false}
        animate={{ opacity: ws ? 1 : 0 }}
        className="absolute flex flex-col gap-2"
        style={{ left: 0, top: 350, width: 250 }}
      >
        <span className="chip border-client/30 bg-client/10 text-[18px] text-client">→ ввод ~30/с</span>
        <span className="chip border-logic/30 bg-logic/10 text-[18px] text-logic">← снимки 20/с</span>
      </motion.div>

      {/* База, миграции, Prisma */}
      <NodeBox
        tone="db"
        icon={Database}
        title="PostgreSQL"
        sub="Wallet, Run…"
        state={step === 0 || mig || prisma || rest ? 'active' : 'idle'}
        className="absolute"
        style={{ left: 1150, top: 230, width: 290 }}
      />
      <motion.div initial={false} animate={{ opacity: mig ? 1 : 0.35 }} className="absolute" style={{ left: 1150, top: 480, width: 290 }}>
        <NodeBox tone="git" icon={FileStack} title="Миграции" sub="15 × up/down .sql" state={mig ? 'active' : 'idle'} />
      </motion.div>
      <motion.div initial={false} animate={{ opacity: prisma ? 1 : 0.35 }} className="absolute" style={{ left: 1150, top: 0, width: 290 }}>
        <NodeBox tone="prisma" icon={FileCode2} title="schema.prisma" sub="модели → типы" state={prisma ? 'active' : 'idle'} />
      </motion.div>

      <Arrow from={[1295, 476]} to={[1295, 336]} tone={mig ? 'git' : 'muted'} flow={mig} width={3} label="migrate:up" />
      <Arrow from={[1295, 226]} to={[1295, 112]} tone={prisma ? 'prisma' : 'muted'} flow={prisma} width={3} label="db pull" />
      <Arrow show={prisma} from={[1146, 60]} to={[REST[3].x + REST[3].w / 2, REST_Y - PILL_H / 2 - 6]} curve={30} tone="prisma" width={3} label="generate" />
      <Arrow from={[REST[3].x + REST[3].w + 3, REST_Y + 10]} to={[1146, 268]} curve={-20} tone={rest ? 'ctrl' : 'muted'} width={3} />
      <Arrow from={[WS[1].x + WS[1].w + 3, WS_Y]} to={[1146, 300]} curve={20} tone={ws ? 'logic' : 'muted'} dashed width={3} label={ws ? 'итоги' : undefined} />

      <StepCaption
        step={step}
        tone={mig ? 'git' : prisma ? 'prisma' : rest ? 'ctrl' : ws ? 'logic' : 'accent'}
        captions={[
          'Игра — canvas в браузере, NestJS-бэкенд и PostgreSQL. Два канала связи',
          '① Миграции: как в базе игры появлялись кошелёк, забеги, сундуки',
          '② Prisma: откуда код знает про таблицы и как не потерять деньги',
          '③ REST: лавка и кошелёк — обычные запросы по слоям, как в etalon',
          '④ WebSocket: бой в реальном времени — и считает его сервер',
        ]}
      />
    </SlideLayout>
  );
}
