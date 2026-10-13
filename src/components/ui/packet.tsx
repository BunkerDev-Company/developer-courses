'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

interface PacketProps {
  /** Центр пакета в координатах родителя. Меняется → пакет летит. */
  at: readonly [number, number];
  show?: boolean;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

/** «Пакет» данных, который перелетает между блоками схемы. */
export function Packet({ at, show = true, tone = 'accent', className, children }: PacketProps) {
  const t = TONE[tone];
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-20"
      initial={false}
      animate={{ x: at[0], y: at[1], opacity: show ? 1 : 0, scale: show ? 1 : 0.6 }}
      transition={{ ...SPRING, opacity: { duration: 0.25 } }}
    >
      <div
        className={cn(
          '-translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border-2 bg-surface px-4 py-2 font-mono text-[18px] font-semibold shadow-lift',
          t.border,
          t.text,
          className,
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
