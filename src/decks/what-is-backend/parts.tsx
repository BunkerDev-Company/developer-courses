'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export type TileState = 'idle' | 'active' | 'dim' | 'done';

interface TileProps {
  tone: Tone;
  icon: LucideIcon;
  title: React.ReactNode;
  sub?: React.ReactNode;
  state?: TileState;
  size?: 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TILE_SIZE = {
  md: { circle: 'h-24 w-24', icon: 52, title: 'text-[28px]' },
  lg: { circle: 'h-32 w-32', icon: 68, title: 'text-[32px]' },
} as const;

/** Вертикальная «станция» схемы: крупная иконка-картинка, название, роль. */
export function Tile({ tone, icon: Icon, title, sub, state = 'idle', size = 'md', className, style, children }: TileProps) {
  const t = TONE[tone];
  const z = TILE_SIZE[size];
  const active = state === 'active';
  return (
    <motion.div
      style={style}
      initial={false}
      animate={{ scale: active ? 1.04 : 1, opacity: state === 'dim' ? 0.4 : 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        'relative flex flex-col items-center rounded-3xl border-2 bg-surface px-5 pb-5 pt-6 text-center shadow-card transition-[border-color,box-shadow] duration-300',
        active ? cn(t.border, t.ring) : 'border-border',
        state === 'done' && 'border-success/60',
        className,
      )}
    >
      <div className={cn('flex items-center justify-center rounded-full', z.circle, t.soft, t.text)}>
        <Icon size={z.icon} strokeWidth={1.75} />
      </div>
      <div className={cn('mt-4 font-bold leading-tight', z.title)}>{title}</div>
      {sub && <div className="mt-1.5 text-[20px] leading-snug text-text-2">{sub}</div>}
      {children}
      {state === 'done' && <DoneBadge />}
    </motion.div>
  );
}

/** Зелёная галочка в углу блока. */
export function DoneBadge({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn(
        'absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-success text-white shadow-card',
        className,
      )}
    >
      <Check size={22} strokeWidth={3} />
    </motion.div>
  );
}

interface BrowserWindowProps {
  url: string;
  active?: boolean;
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Мини-окно браузера: точки, адресная строка, содержимое страницы. */
export function BrowserWindow({ url, active, tone = 'client', className, style, children }: BrowserWindowProps) {
  const t = TONE[tone];
  return (
    <div
      style={style}
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border-2 bg-surface shadow-card transition-[border-color,box-shadow] duration-300',
        active ? cn(t.border, t.ring) : 'border-border',
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-border bg-surface-2 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-border-2" />
          <span className="h-3 w-3 rounded-full bg-border-2" />
          <span className="h-3 w-3 rounded-full bg-border-2" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-lg bg-surface px-3 py-1 font-mono text-[16px] text-text-2">
          {url}
        </span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

interface ZoneProps {
  label: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  /** Пунктирная граница «за кулисами» вместо сплошной. */
  dashed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Подложка-зона схемы с подписью сверху слева: «Зал», «Кухня», «Бэкенд». */
export function Zone({ label, icon: Icon, tone = 'muted', dashed, className, style }: ZoneProps) {
  const t = TONE[tone];
  return (
    <div
      style={style}
      className={cn(
        'absolute rounded-3xl border-2',
        dashed ? 'border-dashed border-border-2 bg-surface-2/60' : 'border-border bg-surface/50',
        className,
      )}
    >
      <div className={cn('absolute left-6 top-4 flex items-center gap-2.5 text-[22px] font-semibold', t.text)}>
        {Icon && <Icon size={24} />}
        {label}
      </div>
    </div>
  );
}

interface PillProps {
  tone?: Tone;
  icon?: LucideIcon;
  solid?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Плашка обычным шрифтом (для русских слов; для кода — Chip). */
export function Pill({ tone = 'muted', icon: Icon, solid, className, children }: PillProps) {
  const t = TONE[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-xl border-2 px-3 py-1 text-[21px] font-semibold leading-tight',
        solid ? cn(t.bg, t.border, 'text-white') : cn(t.soft, t.borderSoft, t.text),
        className,
      )}
    >
      {Icon && <Icon size={21} strokeWidth={2.25} />}
      {children}
    </span>
  );
}
