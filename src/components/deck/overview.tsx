'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SECTIONS } from '@/lib/sections';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SectionKey, SlideDef } from '@/types';

interface Props {
  slides: SlideDef[];
  current: number;
  onPick: (index: number) => void;
  onClose: () => void;
}

/** Оглавление (O): быстро вернуться к слайду, если спросили «а покажите ещё раз». */
export function Overview({ slides, current, onPick, onClose }: Props) {
  const groups = slides.reduce<{ section: SectionKey; items: { s: SlideDef; i: number }[] }[]>(
    (acc, s, i) => {
      const last = acc[acc.length - 1];
      if (last && last.section === s.section) last.items.push({ s, i });
      else acc.push({ section: s.section, items: [{ s, i }] });
      return acc;
    },
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 overflow-auto bg-bg/95 p-10 backdrop-blur"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть оглавление"
        className="fixed right-6 top-6 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-text-2 shadow-card transition-colors hover:text-text"
      >
        <X size={22} />
      </button>
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => {
          const tone = TONE[SECTIONS[g.section].tone];
          return (
            <section key={g.section + g.items[0].i}>
              <h2 className={cn('eyebrow mb-3 !text-sm', tone.text)}>{SECTIONS[g.section].label}</h2>
              <ol className="space-y-1">
                {g.items.map(({ s, i }) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onPick(i)}
                      className={cn(
                        'flex w-full items-baseline gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-2',
                        i === current && cn(tone.soft, 'font-semibold'),
                      )}
                    >
                      <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted">{i + 1}</span>
                      <span>{s.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
      <p className="mt-10 text-center text-sm text-muted">O / Esc — закрыть</p>
    </motion.div>
  );
}
