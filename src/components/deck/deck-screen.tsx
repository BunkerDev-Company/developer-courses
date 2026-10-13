'use client';

import Link from 'next/link';
import { findDeck } from '@/decks';
import { Deck } from './deck';

/** Экран презентации по id. Клиентский: слайды — компоненты, через границу server→client их не передать. */
export function DeckScreen({ id }: { id: string }) {
  const deck = findDeck(id);

  if (!deck || deck.slides.length === 0) {
    return (
      <main className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-2xl font-semibold">{deck ? 'В этой презентации пока нет слайдов' : 'Презентация не найдена'}</p>
        <Link href="/" className="text-accent underline">
          ← Все презентации
        </Link>
      </main>
    );
  }

  return <Deck deck={deck} />;
}
