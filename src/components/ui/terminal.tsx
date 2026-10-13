'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TermLine {
  text: string;
  /** cmd — команда с `$`, ok/err — зелёный/красный результат, dim — служебный вывод. */
  kind?: 'cmd' | 'out' | 'ok' | 'err' | 'dim';
}

const KIND_CLASS: Record<NonNullable<TermLine['kind']>, string> = {
  cmd: 'text-code-text font-semibold',
  out: 'text-code-text/85',
  ok: 'text-code-string',
  err: 'text-code-prop',
  dim: 'text-code-comment',
};

interface TerminalProps {
  /** Все строки, которые видны сейчас. Новые въезжают снизу, старые уходят вверх. */
  lines: TermLine[];
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md';
}

/** Окно терминала. Прижато к низу: последние строки всегда видны. */
export function Terminal({ lines, title = 'terminal', className, style, size = 'md' }: TerminalProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl bg-code-bg shadow-lift ring-1 ring-code-line/10', className)} style={style}>
      <div className="flex shrink-0 items-center gap-4 border-b border-code-line/10 px-5 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="font-mono text-[15px] text-code-text/60">{title}</span>
      </div>
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-5 py-4 font-mono leading-[1.5] [mask-image:linear-gradient(to_bottom,transparent,black_40px)]',
          size === 'sm' ? 'text-[16px]' : 'text-[19px]',
        )}
      >
        <AnimatePresence initial={false}>
          {lines.map((l, i) => (
            <motion.div
              key={`${i}-${l.text}`}
              layout="position"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.04 }}
              className={cn('whitespace-pre', KIND_CLASS[l.kind ?? 'out'])}
            >
              {l.kind === 'cmd' && <span className="text-code-string">$ </span>}
              {l.text || ' '}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
