import { Server } from 'lucide-react';
import type { DeckDef } from '@/types';
import { introSlides } from './intro';
import { migrationSlides } from './migrations';
import { outroSlides } from './outro';
import { prismaSlides } from './prisma';
import { requestSlides } from './request';

export const backendInsideDeck: DeckDef = {
  id: 'backend-inside',
  folder: 'backend',
  title: 'Бэкенд изнутри',
  description:
    'Как меняется структура базы (миграции), откуда код знает про таблицы (Prisma) и через какие слои NestJS проходит каждый запрос — на коде etalon-backend.',
  topics: [
    'Миграции: up/down, таблица pgmigrations, правила',
    'Prisma: db pull → schema.prisma → generate → типы',
    'Путь запроса: Guard → Controller → Bus → Handler → Prisma → ответ',
    'Ошибки, конверт ответа, кто за что отвечает',
  ],
  duration: '60–80 мин',
  level: 'после «Что такое бэкенд»',
  tone: 'ctrl',
  icon: Server,
  // Порядок лекции. Новый слайд — в массив своего раздела (<раздел>/index.ts).
  slides: [...introSlides, ...migrationSlides, ...prismaSlides, ...requestSlides, ...outroSlides],
};
