import { Swords } from 'lucide-react';
import type { DeckDef } from '@/types';
import { introSlides } from './intro';
import { migrationSlides } from './migrations';
import { outroSlides } from './outro';
import { prismaSlides } from './prisma';
import { realtimeSlides } from './realtime';
import { requestSlides } from './request';

export const dungeonInsideDeck: DeckDef = {
  id: 'dungeon-inside',
  folder: 'backend',
  title: 'Бэкенд изнутри: игра «Подземелье»',
  description:
    'Тот же «Бэкенд изнутри», но на коде игры dungeon-backend: история её миграций, Prisma и деньги, путь REST-запроса и то, чего нет в магазине, — бой в реальном времени, который считает сервер.',
  topics: [
    '15 миграций игры: NOT NULL, деньги, потеря данных, «применённую не правят»',
    'Prisma: CHECK не в схеме, гонка двух вкладок, $transaction',
    'Покупка в лавке: guard → контроллер → шина → хендлер → событие',
    'WebSocket: рукопожатие, тонкий гейтвей, горячий путь input',
    'Цикл 20 Гц, бюджет ввода, бинарные снимки, итоги в базу',
  ],
  duration: '80–100 мин',
  level: 'после «Бэкенд изнутри»',
  tone: 'accent',
  icon: Swords,
  // Порядок лекции. Новый слайд — в массив своего раздела (<раздел>/index.ts).
  slides: [...introSlides, ...migrationSlides, ...prismaSlides, ...requestSlides, ...realtimeSlides, ...outroSlides],
};
