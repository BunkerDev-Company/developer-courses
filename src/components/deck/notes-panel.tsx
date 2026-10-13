'use client';

import { motion } from 'framer-motion';
import { SECTIONS } from '@/lib/sections';
import type { SlideDef } from '@/types';

interface Props {
  slide: SlideDef;
  index: number;
  step: number;
}

/** Заметки лектора (N). Рисуются поверх экрана, не внутри сцены. */
export function NotesPanel({ slide, index, step }: Props) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed inset-x-4 bottom-4 z-40 max-h-[45vh] overflow-auto rounded-2xl border border-white/10 bg-black/85 p-5 text-white shadow-lift backdrop-blur"
    >
      <div className="mb-2 flex items-baseline justify-between gap-4 text-sm text-white/60">
        <span>
          {SECTIONS[slide.section].label} · {index + 1}. {slide.title}
        </span>
        <span>
          шаг {step + 1} / {slide.steps} · N — скрыть
        </span>
      </div>
      {slide.notes?.length ? (
        <ul className="list-disc space-y-1.5 pl-5 text-lg leading-snug">
          {slide.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      ) : (
        <p className="text-white/50">Заметок нет.</p>
      )}
    </motion.aside>
  );
}
