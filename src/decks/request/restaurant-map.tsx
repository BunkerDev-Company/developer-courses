'use client';

import { motion } from 'framer-motion';
import { Check, Eye, EyeOff } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { ROLES, type RoleKey } from './restaurant';

/**
 * Карта ресторана — общая для «Зала» и «Кухни». U-образная, как схема пути запроса:
 *   верх  →  Гость → Охранник → Хостес → Официант → Раздача → Повар ⇄ Склад
 *   низ   ←  Гость ← Поднос ←──────────── Тарелка ← (Повар)      Техника ⇢ Повар
 * Что видно и что подсвечено — задаёт фаза (MapPhase), её выбирает презентация по шагу.
 */

export interface MapPhase {
  /** Все работники. false — только четверо из «Что такое бэкенд»: гость, официант, повар, склад. */
  full: boolean;
  /** Подписи NestJS под каждым работником. */
  tech: boolean;
  /** Какая половина ресторана сейчас в фокусе. */
  focus?: 'hall' | 'kitchen';
  /** Зал уже разобрали — галочки. */
  hallDone?: boolean;
}

const W = 170;
const H = 170;
const COL = (1440 - W) / 6; // ≈ 211.7
const colX = (i: number) => i * COL;
const colC = (i: number) => colX(i) + W / 2;
const TOP = 58;
const BOT = 318;
const MID = TOP + H / 2;
const BOT_MID = BOT + H / 2;

type StationKey = RoleKey | 'guestBack';

interface StationDef {
  key: StationKey;
  role: RoleKey;
  col: number;
  y: number;
  /** Подпись NestJS вместо той, что в ROLES. */
  tech?: string;
}

const STATIONS: StationDef[] = [
  { key: 'guest', role: 'guest', col: 0, y: TOP },
  { key: 'guard', role: 'guard', col: 1, y: TOP },
  { key: 'host', role: 'host', col: 2, y: TOP },
  { key: 'waiter', role: 'waiter', col: 3, y: TOP },
  { key: 'pass', role: 'pass', col: 4, y: TOP },
  { key: 'cook', role: 'cook', col: 5, y: TOP },
  { key: 'storage', role: 'storage', col: 6, y: TOP },
  { key: 'guestBack', role: 'guest', col: 0, y: BOT, tech: '201 Created' },
  { key: 'tray', role: 'tray', col: 3, y: BOT },
  { key: 'plate', role: 'plate', col: 5, y: BOT },
  { key: 'tools', role: 'tools', col: 6, y: BOT },
];

/** Кто был в первой лекции про ресторан. */
const BASIC = new Set<StationKey>(['guest', 'waiter', 'cook', 'storage']);
const HALL = new Set<StationKey>(['guest', 'guard', 'host', 'waiter']);
const KITCHEN = new Set<StationKey>(['pass', 'cook', 'storage', 'tools', 'plate', 'tray']);

type StationState = 'hidden' | 'idle' | 'active' | 'dim' | 'done';

function stateOf(key: StationKey, p: MapPhase): StationState {
  if (!p.full && !BASIC.has(key)) return 'hidden';
  if (p.focus) {
    const set = p.focus === 'hall' ? HALL : KITCHEN;
    return set.has(key) ? 'active' : 'dim';
  }
  return p.hallDone && HALL.has(key) ? 'done' : 'idle';
}

interface Link {
  from: [number, number];
  to: [number, number];
  /** Чьим цветом красить — обычно того, к кому идёт. */
  a: StationKey;
  b: StationKey;
  dashed?: boolean;
  curve?: number;
}

/** Первая лекция: гость → официант → повар ⇄ склад (промежуточных работников ещё нет). */
const BASIC_LINKS: Link[] = [
  { from: [colX(0) + W + 6, MID], to: [colX(3) - 8, MID], a: 'guest', b: 'waiter' },
  { from: [colX(3) + W + 6, MID], to: [colX(5) - 8, MID], a: 'waiter', b: 'cook' },
];

const TOP_ORDER: StationKey[] = ['guest', 'guard', 'host', 'waiter', 'pass', 'cook'];

const FULL_LINKS: Link[] = [
  ...TOP_ORDER.map((k, i) => ({
    from: [colX(i) + W + 5, MID] as [number, number],
    to: [colX(i + 1) - 7, MID] as [number, number],
    a: k,
    b: TOP_ORDER[i + 1] ?? 'storage',
  })),
  { from: [colC(5), TOP + H + 6], to: [colC(5), BOT - 8], a: 'cook', b: 'plate' },
  { from: [colX(5) - 6, BOT_MID], to: [colX(3) + W + 8, BOT_MID], a: 'plate', b: 'tray' },
  { from: [colX(3) - 6, BOT_MID], to: [colX(0) + W + 8, BOT_MID], a: 'tray', b: 'guestBack' },
  { from: [colX(6) + 22, BOT - 6], to: [colX(5) + W - 18, TOP + H + 8], a: 'tools', b: 'cook', dashed: true },
];

// Повар ⇄ склад: туда за продуктами и обратно — две стрелки, есть и в первой лекции.
const STORAGE_LINKS: Link[] = [
  { from: [colX(5) + W + 5, MID - 16], to: [colX(6) - 7, MID - 16], a: 'cook', b: 'storage' },
  { from: [colX(6) - 5, MID + 16], to: [colX(5) + W + 7, MID + 16], a: 'storage', b: 'cook' },
];

function linkTone(l: Link, p: MapPhase): Tone {
  const sa = stateOf(l.a, p);
  const sb = stateOf(l.b, p);
  if (sa === 'dim' || sb === 'dim') return 'muted';
  return ROLES[STATIONS.find((s) => s.key === l.b)!.role].tone;
}

function Station({ def, state, tech }: { def: StationDef; state: StationState; tech: boolean }) {
  const r = ROLES[def.role];
  const t = TONE[r.tone];
  const active = state === 'active';
  return (
    <motion.div
      className={cn(
        'absolute flex flex-col items-center rounded-3xl border-2 bg-surface pt-5 text-center shadow-card transition-[border-color,box-shadow] duration-300',
        active ? cn(t.border, t.ring) : state === 'done' ? 'border-success/60' : 'border-border',
      )}
      style={{ left: colX(def.col), top: def.y, width: W, height: H }}
      initial={false}
      animate={{
        opacity: state === 'hidden' ? 0 : state === 'dim' ? 0.35 : 1,
        scale: state === 'hidden' ? 0.85 : active ? 1.05 : 1,
      }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', t.soft, t.text)}>
        <r.icon size={36} strokeWidth={1.9} />
      </div>
      <div className="mt-3 text-[26px] font-bold leading-tight">{r.name}</div>
      <motion.div
        className={cn('mt-1 whitespace-nowrap font-mono text-[17px] font-semibold', t.text)}
        initial={false}
        animate={{ opacity: tech ? 1 : 0, y: tech ? 0 : 6 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        {def.tech ?? r.tech}
      </motion.div>
      {state === 'done' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-success text-white shadow-card"
        >
          <Check size={22} strokeWidth={3} />
        </motion.div>
      )}
    </motion.div>
  );
}

function ZoneBox({
  label,
  icon: Icon,
  tone,
  focused,
  done,
  style,
}: {
  label: string;
  icon: typeof Eye;
  tone: Tone;
  focused: boolean;
  done?: boolean;
  style: React.CSSProperties;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        'absolute rounded-3xl border-2 transition-colors duration-300',
        focused ? cn(t.borderSoft, 'bg-surface/70') : 'border-dashed border-border-2 bg-surface-2/50',
      )}
      style={style}
    >
      <div className={cn('absolute left-6 top-3 flex items-center gap-2.5 text-[22px] font-semibold', t.text)}>
        <Icon size={24} />
        {label}
        {focused && (
          <Chip tone={tone} solid size="sm" className="ml-2">
            сегодня
          </Chip>
        )}
        {done && (
          <Chip tone="success" size="sm" className="ml-2">
            разобрали
          </Chip>
        )}
      </div>
    </div>
  );
}

interface Props {
  step: number;
  /** Фаза на каждый шаг слайда. */
  phases: MapPhase[];
  captions: React.ReactNode[];
  title: React.ReactNode;
}

export function RestaurantMap({ step, phases, captions, title }: Props) {
  const p = phases[Math.min(step, phases.length - 1)];
  const captionTone: Tone = p.focus === 'kitchen' ? 'logic' : p.focus === 'hall' ? 'ctrl' : 'accent';

  return (
    <SlideLayout section="intro" title={title}>
      <ZoneBox
        label="Зал — видит гость"
        icon={Eye}
        tone="client"
        focused={p.focus === 'hall' && !p.hallDone}
        done={p.hallDone}
        style={{ left: -16, top: 0, width: colX(3) + W + 32, height: BOT + H + 18 }}
      />
      <ZoneBox
        label="Кухня — гостю не видна"
        icon={EyeOff}
        tone="logic"
        focused={p.focus === 'kitchen'}
        style={{ left: colX(4) - 16, top: 0, width: 1440 - colX(4) + 32, height: BOT + H + 18 }}
      />

      {BASIC_LINKS.map((l, i) => (
        <Arrow key={`b${i}`} show={!p.full} from={l.from} to={l.to} tone={linkTone(l, p)} width={3} />
      ))}
      {FULL_LINKS.map((l, i) => (
        <Arrow
          key={`f${i}`}
          show={p.full}
          from={l.from}
          to={l.to}
          tone={linkTone(l, p)}
          dashed={l.dashed}
          curve={l.curve}
          width={3}
          delay={p.full ? 0.2 + i * 0.04 : 0}
        />
      ))}
      {STORAGE_LINKS.map((l, i) => (
        <Arrow key={`s${i}`} from={l.from} to={l.to} tone={linkTone(l, p)} width={3} />
      ))}

      {STATIONS.map((s) => (
        <Station key={s.key} def={s} state={stateOf(s.key, p)} tech={p.tech} />
      ))}

      <StepCaption step={step} tone={captionTone} captions={captions} />
    </SlideLayout>
  );
}
