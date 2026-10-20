'use client';

import type { SlideProps } from '@/types';
import { RestaurantMap, type MapPhase } from '../request/restaurant-map';

/**
 * Шаги:
 * 0 — ресторан целиком, с двойниками в NestJS (повторение)
 * 1 — в прошлый раз: зал — галочки
 * 2 — сегодня: кухня
 */
const PHASES: MapPhase[] = [
  { full: true, tech: true },
  { full: true, tech: true, hallDone: true },
  { full: true, tech: true, hallDone: true, focus: 'kitchen' },
];

export function KitchenMapSlide({ step }: SlideProps) {
  return (
    <RestaurantMap
      step={step}
      phases={PHASES}
      title="Ресторан: где мы остановились"
      captions={[
        'Ресторан целиком — это и есть путь запроса в NestJS',
        'В прошлый раз — зал: гостя пустили, заказ приняли, чек выписали',
        'Сегодня — кухня: от чека до подноса',
      ]}
    />
  );
}
