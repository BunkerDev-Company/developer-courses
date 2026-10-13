'use client';

import { motion } from 'framer-motion';

const KEYS: [string, string][] = [
  ['→  Пробел  PageDown  клик', 'дальше (следующий шаг, потом слайд)'],
  ['←  PageUp  клик слева', 'назад'],
  ['Home / End', 'первый / последний слайд'],
  ['O', 'оглавление презентации'],
  ['N', 'заметки лектора'],
  ['F', 'полный экран'],
  ['B', 'чёрный экран (пауза)'],
  ['T', 'светлая / тёмная тема'],
  ['?', 'эта подсказка'],
];

/** Подсказка по клавишам. Закрывается любой клавишей или кликом. */
export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-bg/80 p-6 backdrop-blur"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="card w-full max-w-xl p-7">
        <h2 className="mb-5 text-2xl font-bold">Управление</h2>
        <dl className="space-y-2.5">
          {KEYS.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-4">
              <dt className="w-64 shrink-0 font-mono text-sm font-semibold text-text-2">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-muted">
          Клавиши работают и в русской раскладке. Кликер для презентаций тоже подходит.
        </p>
      </div>
    </motion.div>
  );
}
