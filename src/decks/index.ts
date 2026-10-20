import { Blocks, Database, Lightbulb } from 'lucide-react';
import type { DeckDef, FolderDef } from '@/types';
import { backendHallDeck } from './backend-hall';
import { backendInsideDeck } from './backend-inside';
import { backendKitchenDeck } from './backend-kitchen';
import { dungeonInsideDeck } from './dungeon-inside';
import { smartHomeDeck } from './smart-home';
import { whatIsBackendDeck } from './what-is-backend';
import { whatIsFrontendDeck } from './what-is-frontend';

/** Папки на главной — в этом порядке. */
export const FOLDERS: FolderDef[] = [
  {
    id: 'basics',
    title: 'Основы веба',
    description: 'С чего начать: из каких частей состоит любое веб-приложение',
    tone: 'accent',
    icon: Blocks,
  },
  {
    id: 'backend',
    title: 'Бэкенд',
    description: 'Как устроен сервер: база, Prisma, NestJS',
    tone: 'ctrl',
    icon: Database,
  },
  {
    id: 'applied',
    title: 'Бэкенд в жизни',
    description: 'Где ещё работает бэкенд: устройства, датчики, автоматизация',
    tone: 'success',
    icon: Lightbulb,
  },
];

/** Все презентации. Новая — папка в src/decks/<id>/ + строка здесь. */
export const DECKS: DeckDef[] = [
  whatIsFrontendDeck,
  whatIsBackendDeck,
  backendInsideDeck,
  backendHallDeck,
  backendKitchenDeck,
  dungeonInsideDeck,
  smartHomeDeck,
];

export function findDeck(id: string): DeckDef | undefined {
  return DECKS.find((d) => d.id === id);
}
