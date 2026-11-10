import { Blocks, BriefcaseBusiness, Database, Lightbulb, Workflow } from 'lucide-react';
import type { DeckDef, FolderDef } from '@/types';
import { backendHallDeck } from './backend-hall';
import { backendInsideDeck } from './backend-inside';
import { backendKitchenDeck } from './backend-kitchen';
import { dungeonInsideDeck } from './dungeon-inside';
import { itCareerDeck } from './it-career';
import { itCompanyDeck } from './it-company';
import { smartHomeDeck } from './smart-home';
import { teamToolsDeck } from './team-tools';
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
  {
    id: 'career',
    title: 'Работа в IT',
    description: 'Как устроены IT-компании изнутри: роли, процессы, культура, карьера',
    tone: 'git',
    icon: BriefcaseBusiness,
  },
  {
    id: 'teamwork',
    title: 'Командная разработка',
    description: 'Как команда делает продукт вместе: Agile, трекер, git, ревью и CI',
    tone: 'ctrl',
    icon: Workflow,
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
  itCompanyDeck,
  itCareerDeck,
  teamToolsDeck,
];

export function findDeck(id: string): DeckDef | undefined {
  return DECKS.find((d) => d.id === id);
}
