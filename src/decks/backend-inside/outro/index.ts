import type { SlideDef } from '@/types';
import { EndSlide } from './end-slide';
import { RecipeSlide } from './recipe-slide';

export const outroSlides: SlideDef[] = [
  {
    id: 'outro-recipe',
    section: 'outro',
    title: 'Рецепт: добавить поле',
    steps: 4,
    Component: RecipeSlide,
    notes: [
      'Связываем три темы одной задачей: «товару нужна категория».',
      'Порядок не случаен: без колонки в базе Prisma её не увидит, без типов код не соберётся.',
      'Спросить аудиторию: что будет, если забыть prisma:pull? (TS не знает поле category — ошибка сборки.)',
      'implements CreateItemInput в DTO — компилятор сам напомнит добавить поле в DTO.',
    ],
  },
  {
    id: 'outro-end',
    section: 'outro',
    title: 'Итог',
    steps: 4,
    Component: EndSlide,
    notes: [
      'Три мысли по одной на клик. Последний клик — «Вопросы?».',
      'Домашка: добавить в свой проект поле по рецепту с прошлого слайда.',
    ],
  },
];
