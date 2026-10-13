'use client';

import { motion } from 'framer-motion';
import { Check, Clock, GraduationCap, Layers, MousePointerClick, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadPos, type SavedPos } from '@/lib/deck-progress';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { DeckDef } from '@/types';
import { plural } from './deck-card';
import { SlideThumb } from './slide-thumb';

/** Правая панель: суть выбранной презентации и кнопки запуска. */
export function DeckDetails({ deck }: { deck: DeckDef | null }) {
  return (
    <div className="card overflow-hidden">
      {/* Перемонтирование по ключу вместо AnimatePresence: смена сразу после загрузки
          (выбор из ?d=) в StrictMode застревала на exit-анимации. */}
      <motion.div
        key={deck?.id ?? 'empty'}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        {deck ? (
          <Details deck={deck} />
        ) : (
          <div className="flex flex-col items-center gap-4 px-8 py-16 text-center text-text-2">
            <MousePointerClick size={44} className="text-muted" />
            <p className="text-lg">Выберите презентацию — здесь появится, о чём она</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Details({ deck }: { deck: DeckDef }) {
  const t = TONE[deck.tone];
  const count = deck.slides.length;
  const [saved, setSaved] = useState<SavedPos | null>(null);

  // localStorage — только после mount, иначе расхождение с серверным HTML.
  useEffect(() => setSaved(loadPos(deck.id)), [deck.id]);

  const resume = saved && saved.slide > 0 && saved.slide < count ? saved : null;

  return (
    <div>
      <div className="p-5 pb-0">
        {count > 0 ? (
          <SlideThumb slide={deck.slides[0]} />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border-2 text-text-2">
            Слайды скоро появятся
          </div>
        )}
      </div>

      <div className="space-y-5 p-6">
        <div>
          <h2 className="text-[28px] font-bold leading-tight">{deck.title}</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-text-2">{deck.description}</p>
        </div>

        {count > 0 && (
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/p/${deck.id}`}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-card transition-transform active:scale-[0.98]',
                t.bg,
              )}
            >
              <Play size={18} fill="currentColor" />
              Начать
            </Link>
            {resume && (
              <Link
                href={`/p/${deck.id}#${resume.slide + 1}.${resume.step}`}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-surface px-5 py-3 font-semibold text-text-2 transition-colors hover:border-border-2 hover:text-text"
              >
                <RotateCcw size={18} />
                Продолжить со слайда {resume.slide + 1}
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-sm">
          <Meta icon={Layers}>{count > 0 ? `${count} ${plural(count, 'слайд', 'слайда', 'слайдов')}` : 'готовится'}</Meta>
          <Meta icon={Clock}>{deck.duration}</Meta>
          <Meta icon={GraduationCap}>{deck.level}</Meta>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">О чём</h3>
          <ul className="space-y-2">
            {deck.topics.map((topic) => (
              <li key={topic} className="flex gap-3 text-[16px] leading-snug">
                <Check size={18} className={cn('mt-0.5 shrink-0', t.text)} strokeWidth={2.5} />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

function Meta({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-text-2">
      <Icon size={15} />
      {children}
    </span>
  );
}
