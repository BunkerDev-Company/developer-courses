'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

interface Props {
  step: number;
  /** Подпись на каждый шаг. null — на этом шаге подписи нет. Шагов больше, чем подписей → последняя. */
  captions: (React.ReactNode | null)[];
  tone?: Tone;
  className?: string;
}

/**
 * Крупная подпись «что происходит сейчас» внизу слайда.
 * По умолчанию прижата к низу области контента и центрирована.
 */
export function StepCaption({ step, captions, tone = 'accent', className }: Props) {
  const i = Math.min(step, captions.length - 1);
  const text = captions[i];

  return (
    <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 flex justify-center', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {text && (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-7 py-3.5 text-[28px] font-semibold leading-snug shadow-card"
          >
            <span className={cn('h-8 w-1.5 shrink-0 rounded-full', TONE[tone].bg)} />
            <span>{text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
