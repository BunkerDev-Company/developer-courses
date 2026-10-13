'use client';

import { motion } from 'framer-motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { DeckDef } from '@/types';

interface Props {
  deck: DeckDef;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

/** Карточка-«папка» презентации. Клик — показать описание, двойной клик — открыть. */
export function DeckCard({ deck, selected, onSelect, onOpen }: Props) {
  const t = TONE[deck.tone];
  const Icon = deck.icon;
  const count = deck.slides.length;

  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      onDoubleClick={onOpen}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="group relative pt-3 text-left focus:outline-none"
    >
      {/* Ушко папки */}
      <span className={cn('absolute left-6 top-0 h-5 w-24 rounded-t-lg transition-colors', selected ? t.bg : 'bg-border-2 group-hover:bg-muted')} />
      <span
        className={cn(
          'relative flex h-full flex-col gap-4 rounded-2xl rounded-tl-md border-2 bg-surface p-6 shadow-card transition-[border-color,box-shadow] duration-200',
          selected ? cn(t.border, t.ring) : 'border-border group-hover:border-border-2 group-hover:shadow-lift',
        )}
      >
        <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', t.soft, t.text)}>
          <Icon size={30} />
        </span>
        <span className="text-2xl font-bold leading-tight">{deck.title}</span>
        <span className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-2">
          <span>{count > 0 ? `${count} ${plural(count, 'слайд', 'слайда', 'слайдов')}` : 'готовится'}</span>
          <span className="text-border-2">•</span>
          <span>{deck.duration}</span>
        </span>
      </span>
    </motion.button>
  );
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
