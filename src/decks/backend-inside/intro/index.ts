import type { SlideDef } from '@/types';
import { MapSlide } from './map-slide';
import { TitleSlide } from './title-slide';

export const introSlides: SlideDef[] = [
  {
    id: 'intro-title',
    section: 'intro',
    title: 'Бэкенд изнутри',
    steps: 1,
    Component: TitleSlide,
    notes: [
      'Сегодня три темы, и они связаны одной цепочкой: схема базы → типы в коде → запрос.',
      'Весь код на слайдах — из etalon-backend, который у вас уже есть. Домен — items.',
    ],
  },
  {
    id: 'intro-map',
    section: 'intro',
    title: 'Карта',
    steps: 4,
    Component: MapSlide,
    notes: [
      'Шаг 0: общая картина. Браузер шлёт запрос, NestJS обрабатывает, PostgreSQL хранит.',
      'Шаг 1: откуда в базе вообще берутся таблицы — миграции.',
      'Шаг 2: откуда TypeScript знает, какие в базе колонки, — Prisma читает базу и генерирует типы.',
      'Шаг 3: что происходит с конкретным запросом — по слоям слева направо.',
    ],
  },
];
