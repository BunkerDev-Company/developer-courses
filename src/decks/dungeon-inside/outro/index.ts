import type { SlideDef } from '@/types';
import { DungeonEndSlide } from './end-slide';
import { WeaponRecipeSlide } from './recipe-slide';

export const outroSlides: SlideDef[] = [
  {
    id: 'dg-recipe',
    section: 'outro',
    title: 'Рецепт: новое оружие',
    steps: 4,
    Component: WeaponRecipeSlide,
    notes: [
      'Рецепт из CLAUDE.md игры — он связывает почти все темы. Шаг 0: механика — registerWeapon в weapons/*.ts: числа в defaults (их можно переопределить в админке), поведение — в fire()/tick()/equip() через WeaponCtx.',
      'Шаг 1: новый вид эффекта — в КОНЕЦ списка FX в domain/shared/fx.ts, иначе клиент нарисует не то. Во фронте — рисовальщик и npm run sync:shared.',
      'Шаг 2: строка каталога — в content/items.ts, а в базу — миграцией данных, SQL генерирует scripts/gen-catalog-sql.ts. Один источник правды. Применённую миграцию каталога не переписывают — новая.',
      'Шаг 3: npm run weapons:check гоняет каждое оружие и эволюцию в отдельной симуляции: урон, ошибки, NaN. Вывод на слайде — настоящий. Домашка из migrations/README.md: сундук-мимик (новый tier: DROP + ADD у chk_chest_tier) или достижения (справочник + UNIQUE (user_id, achievement_id)).',
    ],
  },
  {
    id: 'dg-end',
    section: 'outro',
    title: 'Итог',
    steps: 5,
    Component: DungeonEndSlide,
    notes: [
      'Четыре мысли по одной на клик, последний клик — «Вопросы?».',
      'Главная мысль лекции: игра — тот же бэкенд, что магазин. Те же миграции, Prisma, guard → контроллер → шина → хендлер. Новое — реальное время, и правило то же: клиенту не доверяем, считает сервер.',
      'Спросить: «Можно ли доверять полю kills, если бы его присылал клиент?» (домашка 2 из README: нет — поэтому убийства считает симуляция).',
    ],
  },
];
