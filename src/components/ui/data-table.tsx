'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Table2 } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export type RowState = 'normal' | 'new' | 'hl' | 'dim' | 'removed';

export interface DataRow {
  /** Стабильный ключ: по нему строка анимируется при вставке/удалении. */
  key: string;
  cells: React.ReactNode[];
  state?: RowState;
}

interface DataTableProps {
  title: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  columns: string[];
  /** CSS grid-template-columns, например '60px 1fr 180px'. */
  grid: string;
  rows: DataRow[];
  className?: string;
  style?: React.CSSProperties;
  /** Текст, когда строк нет. */
  empty?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const ROW_STATE: Record<RowState, string> = {
  normal: '',
  new: 'bg-success/10',
  hl: 'bg-accent/10',
  dim: 'opacity-35',
  removed: 'bg-danger/10 text-danger line-through decoration-2',
};

/** Таблица с данными (pgmigrations, строки Item…). Строки въезжают и схлопываются. */
export function DataTable({ title, icon: Icon = Table2, tone = 'db', columns, grid, rows, className, style, empty, size = 'md' }: DataTableProps) {
  const t = TONE[tone];
  return (
    <div className={cn('card overflow-hidden', className)} style={style}>
      <div className={cn('flex items-center gap-3 border-b-2 border-border px-5 py-3', t.soft)}>
        <Icon size={24} className={t.text} />
        <span className="font-mono text-[21px] font-semibold">{title}</span>
      </div>
      <div
        className="grid gap-x-5 border-b border-border px-5 py-2 text-[15px] font-semibold uppercase tracking-wider text-muted"
        style={{ gridTemplateColumns: grid }}
      >
        {columns.map((c) => (
          <div key={c}>{c}</div>
        ))}
      </div>
      <div>
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  'relative grid items-center gap-x-5 border-b border-border/70 px-5 font-mono transition-colors duration-300',
                  size === 'sm' ? 'py-2 text-[17px]' : 'py-2.5 text-[19px]',
                  ROW_STATE[r.state ?? 'normal'],
                )}
                style={{ gridTemplateColumns: grid }}
              >
                {r.state === 'new' && <span className="absolute inset-y-0 left-0 w-1.5 bg-success" />}
                {r.state === 'hl' && <span className="absolute inset-y-0 left-0 w-1.5 bg-accent" />}
                {r.cells.map((c, i) => (
                  <div key={i} className="truncate">
                    {c}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {rows.length === 0 && empty && (
          <div className="px-5 py-4 text-center text-[18px] text-muted">{empty}</div>
        )}
      </div>
    </div>
  );
}
