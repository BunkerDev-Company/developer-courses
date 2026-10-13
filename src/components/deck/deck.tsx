'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { savePos } from '@/lib/deck-progress';
import { initTheme, toggleTheme } from '@/lib/theme';
import type { DeckDef, SlideDef } from '@/types';
import { DeckHeader } from './deck-header';
import { HelpOverlay } from './help-overlay';
import { NotesPanel } from './notes-panel';
import { Overview } from './overview';
import { Progress } from './progress';
import { Stage } from './stage';

interface Pos {
  slide: number;
  step: number;
}

/** Через сколько мс без движения мыши прятать шапку и курсор. */
const IDLE_MS = 2500;

/**
 * `#12.3` → слайд 12, шаг 3 (в адресе слайды с единицы, шаги с нуля).
 * `#mig-runner.3` — то же по id слайда (удобно для скриншотов и ссылок).
 */
function parseHash(hash: string, slides: SlideDef[]): Pos | null {
  const m = /^#([\w-]+?)(?:\.(\d+))?$/.exec(hash);
  if (!m) return null;
  const byId = slides.findIndex((s) => s.id === m[1]);
  const byNum = /^\d+$/.test(m[1]) ? Number(m[1]) - 1 : 0;
  const slide = Math.min(Math.max(byId >= 0 ? byId : byNum, 0), slides.length - 1);
  const step = Math.min(Number(m[2] ?? 0), slides[slide].steps - 1);
  return { slide, step };
}

/**
 * Презентация. Управление:
 *  → / Space / PageDown / клик        — следующий шаг (потом следующий слайд)
 *  ← / PageUp / Backspace / клик слева — назад
 *  Home / End — первый / последний, F — полный экран, B — чёрный экран,
 *  N — заметки лектора, O — оглавление, T — тема, ? или H — подсказка.
 */
export function Deck({ deck }: { deck: DeckDef }) {
  const slides = deck.slides;
  const [pos, setPos] = useState<Pos | null>(null);
  const [dir, setDir] = useState(1);
  const [notes, setNotes] = useState(false);
  const [overview, setOverview] = useState(false);
  const [help, setHelp] = useState(false);
  const [blank, setBlank] = useState(false);
  // Старт со скрытой шапкой: на проекторе сразу только слайд, шапка — по движению мыши.
  const [idle, setIdle] = useState(true);
  const [hoverHeader, setHoverHeader] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const idleTimer = useRef<number>();
  const posRef = useRef(pos);
  posRef.current = pos;

  // Позиция из адреса (переживает F5 посреди лекции), без адреса — с начала.
  useEffect(() => {
    initTheme();
    setPos(parseHash(window.location.hash, slides) ?? { slide: 0, step: 0 });

    const onHash = () => {
      const p = parseHash(window.location.hash, slides);
      if (p) setPos(p);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [slides]);

  useEffect(() => {
    if (!pos) return;
    window.history.replaceState(null, '', `#${pos.slide + 1}.${pos.step}`);
    savePos(deck.id, pos.slide, pos.step);
  }, [pos, deck.id]);

  const go = useCallback((target: Pos) => {
    const cur = posRef.current;
    if (cur && target.slide !== cur.slide) setDir(target.slide > cur.slide ? 1 : -1);
    setPos(target);
  }, []);

  const next = useCallback(() => {
    const p = posRef.current;
    if (!p) return;
    if (p.step < slides[p.slide].steps - 1) go({ ...p, step: p.step + 1 });
    else if (p.slide < slides.length - 1) go({ slide: p.slide + 1, step: 0 });
  }, [slides, go]);

  const prev = useCallback(() => {
    const p = posRef.current;
    if (!p) return;
    if (p.step > 0) go({ ...p, step: p.step - 1 });
    // Назад — на последний шаг предыдущего слайда: картинка целиком.
    else if (p.slide > 0) go({ slide: p.slide - 1, step: slides[p.slide - 1].steps - 1 });
  }, [slides, go]);

  const goTo = useCallback((slide: number) => go({ slide, step: 0 }), [go]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // e.code, а не e.key: клавиши работают и в русской раскладке.
      if (help) {
        setHelp(false);
        return;
      }
      if (overview) {
        if (e.code === 'Escape' || e.code === 'KeyO') setOverview(false);
        return;
      }
      if (blank && e.code !== 'KeyB' && e.code !== 'Period') {
        setBlank(false);
        return;
      }
      if (e.key === '?' || e.code === 'KeyH') {
        setHelp(true);
        return;
      }

      switch (e.code) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case 'Space':
        case 'Enter':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          prev();
          break;
        case 'Home':
          goTo(0);
          break;
        case 'End':
          goTo(slides.length - 1);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyB':
        case 'Period':
          setBlank((b) => !b);
          break;
        case 'KeyN':
          setNotes((n) => !n);
          break;
        case 'KeyO':
          setOverview(true);
          break;
        case 'KeyT':
          toggleTheme();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, goTo, toggleFullscreen, slides.length, overview, blank, help]);

  // Мышь не двигают — прячем шапку и курсор: на проекторе виден только слайд.
  useEffect(() => {
    const wake = () => {
      setIdle(false);
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    window.addEventListener('mousemove', wake);
    return () => {
      window.removeEventListener('mousemove', wake);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  const hideChrome = idle && !hoverHeader && !overview && !help;

  useEffect(() => {
    document.body.classList.toggle('cursor-hidden', hideChrome);
    return () => document.body.classList.remove('cursor-hidden');
  }, [hideChrome]);

  if (!pos) return null;

  const slide = slides[pos.slide];
  const SlideComponent = slide.Component;

  const onClick = (e: React.MouseEvent) => {
    if (e.clientX < window.innerWidth * 0.2) prev();
    else next();
  };

  return (
    <main className="fixed inset-0 select-none overflow-hidden bg-bg" onClick={onClick}>
      <Stage>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={slide.id}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 60 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -60 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <SlideComponent step={pos.step} />
          </motion.div>
        </AnimatePresence>
        <Progress slides={slides} slide={pos.slide} step={pos.step} />
      </Stage>

      <DeckHeader
        deck={deck}
        slide={pos.slide}
        visible={!hideChrome}
        fullscreen={fullscreen}
        notes={notes}
        onHover={setHoverHeader}
        onOverview={() => setOverview(true)}
        onNotes={() => setNotes((n) => !n)}
        onTheme={toggleTheme}
        onFullscreen={toggleFullscreen}
        onHelp={() => setHelp(true)}
      />

      <AnimatePresence>
        {notes && <NotesPanel key="notes" slide={slide} index={pos.slide} step={pos.step} />}
        {overview && (
          <Overview
            key="overview"
            slides={slides}
            current={pos.slide}
            onClose={() => setOverview(false)}
            onPick={(i) => {
              goTo(i);
              setOverview(false);
            }}
          />
        )}
        {help && <HelpOverlay key="help" onClose={() => setHelp(false)} />}
      </AnimatePresence>

      {blank && <div className="fixed inset-0 z-50 bg-black" />}
    </main>
  );
}
