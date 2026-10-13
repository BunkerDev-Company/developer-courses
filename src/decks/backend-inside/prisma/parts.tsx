'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

interface ZoneProps {
  tone: Tone;
  icon: LucideIcon;
  label: React.ReactNode;
  /** active — рамка цвета тона и свечение; dim — приглушена. */
  state?: 'idle' | 'active' | 'dim';
  className?: string;
  style?: React.CSSProperties;
}

/** Пунктирная «зона» на схеме: PostgreSQL, «твой код»… Содержимое кладётся поверх абсолютно. */
export function Zone({ tone, icon: Icon, label, state = 'idle', className, style }: ZoneProps) {
  const t = TONE[tone];
  return (
    <motion.div
      initial={false}
      animate={{ opacity: state === 'dim' ? 0.4 : 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        'rounded-3xl border-2 border-dashed transition-[border-color,box-shadow] duration-300',
        state === 'active' ? cn(t.border, t.ring) : t.borderSoft,
        className,
      )}
      style={style}
    >
      <div className={cn('flex items-center gap-2.5 px-5 pt-3 text-[22px] font-semibold', t.text)}>
        <Icon size={24} strokeWidth={2.25} />
        {label}
      </div>
    </motion.div>
  );
}

interface PlateProps {
  tone: Tone;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** Плашка-вывод: иконка в кружке + крупный текст. Для предупреждений и итогов. */
export function Plate({ tone, icon: Icon, children, className, style }: PlateProps) {
  const t = TONE[tone];
  return (
    <div
      className={cn('flex items-center gap-5 rounded-2xl border-2 bg-surface px-6 py-4 shadow-card', t.border, className)}
      style={style}
    >
      <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
        <Icon size={32} strokeWidth={2.25} />
      </div>
      <div className="min-w-0 text-[24px] font-semibold leading-snug">{children}</div>
    </div>
  );
}
