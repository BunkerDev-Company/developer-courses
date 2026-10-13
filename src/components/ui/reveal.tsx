'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

const OFFSETS = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 40 },
  right: { x: -40 },
  scale: { scale: 0.85 },
  none: {},
} as const;

interface RevealProps {
  /** Показан ли блок. Обычно `step >= N`. Место в раскладке занято всегда. */
  show?: boolean;
  from?: keyof typeof OFFSETS;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Плавное появление по шагу. Скрытый блок занимает место — раскладка не прыгает. */
export function Reveal({ show = true, from = 'up', delay = 0, className, style, children }: RevealProps) {
  const hidden = { opacity: 0, ...OFFSETS[from] };
  const visible = { opacity: 1, x: 0, y: 0, scale: 1 };

  return (
    <motion.div
      className={className}
      style={{ ...style, pointerEvents: show ? undefined : 'none' }}
      initial={hidden}
      animate={show ? visible : hidden}
      transition={{ duration: 0.5, delay: show ? delay : 0, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface SwapProps {
  /** Ключ содержимого: сменился — старое уезжает, новое приезжает. */
  k: string | number;
  className?: string;
  children: React.ReactNode;
}

/** Смена содержимого на месте (текст подписи, вариант кода и т.п.). */
export function Swap({ k, className, children }: SwapProps) {
  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={k}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
