'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Keyboard, List, Maximize, Minimize, MoonStar, StickyNote, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { SECTIONS } from '@/lib/sections';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { DeckDef } from '@/types';

interface Props {
  deck: DeckDef;
  slide: number;
  visible: boolean;
  fullscreen: boolean;
  notes: boolean;
  onHover: (hover: boolean) => void;
  onOverview: () => void;
  onNotes: () => void;
  onTheme: () => void;
  onFullscreen: () => void;
  onHelp: () => void;
}

/**
 * Шапка презентации. Поверх слайда, прячется вместе с курсором, когда мышь не двигают:
 * на проекторе студенты видят только слайд.
 */
export function DeckHeader({ deck, slide, visible, fullscreen, notes, onHover, onOverview, onNotes, onTheme, onFullscreen, onHelp }: Props) {
  const current = deck.slides[slide];
  const section = SECTIONS[current.section];

  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-surface/90 px-4 shadow-card backdrop-blur"
    >
      <Link
        href={`/?d=${deck.id}`}
        className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
      >
        <ArrowLeft size={18} />
        Все презентации
      </Link>

      <div className="h-6 w-px shrink-0 bg-border" />

      <div className="flex min-w-0 flex-1 items-baseline gap-3">
        <span className="truncate font-semibold">{deck.title}</span>
        <span className={cn('hidden shrink-0 text-sm font-medium md:inline', TONE[section.tone].text)}>
          {section.label}
        </span>
        <span className="hidden truncate text-sm text-text-2 lg:inline">· {current.title}</span>
      </div>

      <span className="shrink-0 text-sm tabular-nums text-muted">
        {slide + 1} / {deck.slides.length}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <HeaderButton icon={List} label="Оглавление" hotkey="O" onClick={onOverview} />
        <HeaderButton icon={StickyNote} label="Заметки лектора" hotkey="N" onClick={onNotes} active={notes} />
        <HeaderButton icon={MoonStar} label="Тема" hotkey="T" onClick={onTheme} />
        <HeaderButton icon={fullscreen ? Minimize : Maximize} label="Полный экран" hotkey="F" onClick={onFullscreen} />
        <HeaderButton icon={Keyboard} label="Клавиши" hotkey="?" onClick={onHelp} />
      </div>
    </motion.header>
  );
}

interface HeaderButtonProps {
  icon: LucideIcon;
  label: string;
  hotkey: string;
  active?: boolean;
  onClick: () => void;
}

function HeaderButton({ icon: Icon, label, hotkey, active, onClick }: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${label} (${hotkey})`}
      aria-label={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg text-text-2 transition-colors hover:bg-surface-2 hover:text-text',
        active && 'bg-accent/10 text-accent',
      )}
    >
      <Icon size={19} />
    </button>
  );
}
