'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check, X } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export type NodeState = 'idle' | 'active' | 'dim' | 'done' | 'error';

interface NodeBoxProps {
  tone: Tone;
  icon?: LucideIcon;
  title: React.ReactNode;
  /** Вторая строка: имя класса/файла, моноширинным. */
  sub?: React.ReactNode;
  state?: NodeState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const SIZE = {
  sm: { box: 'gap-3 px-4 py-3', icon: 'h-11 w-11 rounded-xl', iconPx: 24, title: 'text-[20px]', sub: 'text-[15px]' },
  md: { box: 'gap-4 px-5 py-4', icon: 'h-14 w-14 rounded-2xl', iconPx: 30, title: 'text-[24px]', sub: 'text-[17px]' },
  lg: { box: 'gap-5 px-6 py-5', icon: 'h-16 w-16 rounded-2xl', iconPx: 36, title: 'text-[30px]', sub: 'text-[20px]' },
} as const;

/**
 * Блок схемы: слой бэкенда, база, файл. Состояние управляет акцентом:
 * active — подсвечен и чуть больше, dim — приглушён, done — галочка, error — красный.
 */
export function NodeBox({ tone, icon: Icon, title, sub, state = 'idle', size = 'md', className, style, children }: NodeBoxProps) {
  const t = TONE[tone];
  const s = SIZE[size];
  const active = state === 'active';

  return (
    <motion.div
      style={style}
      initial={false}
      animate={{ scale: active ? 1.05 : 1, opacity: state === 'dim' ? 0.35 : 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        'relative flex items-center rounded-2xl border-2 bg-surface shadow-card transition-[border-color,box-shadow,background-color] duration-300',
        s.box,
        active ? cn(t.border, t.ring) : 'border-border',
        state === 'error' && 'border-danger bg-danger/5',
        state === 'done' && 'border-success/60',
        className,
      )}
    >
      {Icon && (
        <div className={cn('flex shrink-0 items-center justify-center', s.icon, t.soft, t.text)}>
          <Icon size={s.iconPx} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <div className={cn('font-semibold leading-tight', s.title)}>{title}</div>
        {sub && <div className={cn('mt-1 truncate font-mono text-text-2', s.sub)}>{sub}</div>}
        {children}
      </div>

      {(state === 'done' || state === 'error') && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-card',
            state === 'done' ? 'bg-success' : 'bg-danger',
          )}
        >
          {state === 'done' ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}
        </motion.div>
      )}
    </motion.div>
  );
}
