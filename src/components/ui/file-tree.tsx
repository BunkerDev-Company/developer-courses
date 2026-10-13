'use client';

import { motion } from 'framer-motion';
import { FileCode2, FileText, Folder } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

export interface FileItem {
  name: React.ReactNode;
  depth: number;
  kind: 'dir' | 'ts' | 'sql' | 'file';
  state?: 'normal' | 'hl' | 'dim' | 'new' | 'hidden';
  /** Пояснение справа: «← обёртка». */
  note?: React.ReactNode;
}

interface FileTreeProps {
  items: FileItem[];
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md';
}

const ICON = { dir: Folder, ts: FileCode2, sql: FileText, file: FileText } as const;

/** Дерево файлов проекта. hidden — строка ещё не появилась (место занято). */
export function FileTree({ items, tone = 'git', className, style, size = 'md' }: FileTreeProps) {
  const t = TONE[tone];
  return (
    <div className={cn('card px-3 py-3 font-mono', size === 'sm' ? 'text-[17px]' : 'text-[20px]', className)} style={style}>
      {items.map((it, i) => {
        const Icon = ICON[it.kind];
        const state = it.state ?? 'normal';
        return (
          <motion.div
            key={i}
            initial={false}
            animate={{
              opacity: state === 'hidden' ? 0 : state === 'dim' ? 0.35 : 1,
              x: state === 'hidden' ? -16 : 0,
            }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              'relative flex items-center gap-2.5 rounded-lg py-1.5 pr-3 transition-colors duration-300',
              state === 'hl' && t.soft,
              state === 'new' && 'bg-success/10',
            )}
            style={{ paddingLeft: 12 + it.depth * 28 }}
          >
            <Icon
              size={size === 'sm' ? 18 : 21}
              className={cn('shrink-0', it.kind === 'dir' ? 'text-warning' : it.kind === 'sql' ? 'text-db' : 'text-ctrl')}
            />
            <span className={cn('whitespace-nowrap', state === 'hl' && 'font-semibold')}>{it.name}</span>
            {it.note && <span className={cn('ml-auto whitespace-nowrap pl-6 font-sans font-semibold', t.text)}>{it.note}</span>}
          </motion.div>
        );
      })}
    </div>
  );
}
