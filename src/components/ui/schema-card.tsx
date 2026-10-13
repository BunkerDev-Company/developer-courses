'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, Table2 } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { RowState } from './data-table';

export interface SchemaColumn {
  name: string;
  type: string;
  pk?: boolean;
  state?: RowState;
}

interface SchemaCardProps {
  /** Имя таблицы как в SQL: Item → покажем "Item". */
  name: string;
  columns: SchemaColumn[];
  tone?: Tone;
  state?: 'normal' | 'hl' | 'dim' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
  /** Плашка в шапке справа (версия миграции, «Петя»…). */
  badge?: React.ReactNode;
}

/** Структура таблицы: колонки и типы. Колонки появляются/исчезают анимированно. */
export function SchemaCard({ name, columns, tone = 'db', state = 'normal', size = 'md', className, style, badge }: SchemaCardProps) {
  const t = TONE[tone];
  const sm = size === 'sm';

  return (
    <motion.div
      style={style}
      initial={false}
      animate={{ opacity: state === 'dim' ? 0.35 : 1 }}
      className={cn(
        'card overflow-hidden transition-[border-color,box-shadow] duration-300',
        state === 'hl' && cn(t.border, t.ring),
        state === 'error' && 'border-danger shadow-[0_0_0_6px_rgb(var(--c-danger)/0.15)]',
        className,
      )}
    >
      <div className={cn('flex items-center gap-3 border-b-2 border-border', t.soft, sm ? 'px-4 py-2' : 'px-5 py-3')}>
        <Table2 size={sm ? 20 : 24} className={t.text} />
        <span className={cn('font-mono font-semibold', sm ? 'text-[18px]' : 'text-[21px]')}>&quot;{name}&quot;</span>
        {badge && <span className="ml-auto">{badge}</span>}
      </div>
      <div className={sm ? 'py-1' : 'py-1.5'}>
        <AnimatePresence initial={false}>
          {columns.map((c) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  'relative flex items-baseline justify-between gap-6 font-mono transition-colors duration-300',
                  sm ? 'px-4 py-1 text-[16px]' : 'px-5 py-1.5 text-[19px]',
                  c.state === 'new' && 'bg-success/10',
                  c.state === 'hl' && 'bg-accent/10',
                  c.state === 'dim' && 'opacity-35',
                  c.state === 'removed' && 'bg-danger/10 text-danger line-through decoration-2',
                )}
              >
                {c.state === 'new' && <span className="absolute inset-y-0 left-0 w-1.5 bg-success" />}
                <span className="flex items-center gap-2">
                  {c.pk && <KeyRound size={sm ? 14 : 16} className="text-warning" />}
                  {c.name}
                </span>
                <span className={cn('text-text-2', c.state === 'removed' && 'text-danger')}>{c.type}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
