'use client';

import { MoonStar, Presentation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DECKS, FOLDERS } from '@/decks';
import { initTheme, toggleTheme } from '@/lib/theme';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { DeckCard, plural } from './deck-card';
import { DeckDetails } from './deck-details';

/** Главная: папки с презентациями слева, суть выбранной — справа. */
export function Library() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Выбор живёт в адресе (?d=…): «Назад» из презентации вернёт к той же карточке.
  useEffect(() => {
    initTheme();
    const d = new URLSearchParams(window.location.search).get('d');
    if (d && DECKS.some((x) => x.id === d)) setSelectedId(d);
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    // pathname, а не '/': на GitHub Pages сайт живёт в /<имя-репозитория>/.
    window.history.replaceState(null, '', `${window.location.pathname}?d=${id}`);
  };

  const open = (id: string) => {
    const deck = DECKS.find((d) => d.id === id);
    if (deck && deck.slides.length > 0) router.push(`/p/${id}`);
  };

  // Enter — открыть выбранную.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && selectedId && document.activeElement === document.body) open(selectedId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const selected = DECKS.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="min-h-full">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-8 py-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white">
            <Presentation size={24} />
          </span>
          <div>
            <div className="text-xl font-bold leading-tight">Презентации для занятий</div>
            <div className="text-sm text-text-2">Анимированные объяснения: листайте стрелками или кликером</div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            title="Светлая / тёмная тема"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
          >
            <MoonStar size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-8 py-10 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-12">
          {FOLDERS.map((folder) => {
            const decks = DECKS.filter((d) => d.folder === folder.id);
            if (decks.length === 0) return null;
            const t = TONE[folder.tone];
            const Icon = folder.icon;
            return (
              <section key={folder.id}>
                <div className="mb-5 flex items-center gap-4">
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl', t.soft, t.text)}>
                    <Icon size={26} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold leading-tight">{folder.title}</h2>
                    <p className="text-text-2">
                      {folder.description} · {decks.length} {plural(decks.length, 'презентация', 'презентации', 'презентаций')}
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {decks.map((deck) => (
                    <DeckCard
                      key={deck.id}
                      deck={deck}
                      selected={deck.id === selectedId}
                      onSelect={() => select(deck.id)}
                      onOpen={() => open(deck.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <DeckDetails deck={selected} />
        </aside>
      </main>
    </div>
  );
}
