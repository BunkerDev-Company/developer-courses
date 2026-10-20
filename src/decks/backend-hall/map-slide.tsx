'use client';

import type { SlideProps } from '@/types';
import { RestaurantMap, type MapPhase } from '../request/restaurant-map';

/**
 * Шаги:
 * 0 — четверо из «Что такое бэкенд»: гость, официант, повар, склад
 * 1 — в настоящем ресторане людей больше
 * 2 — у каждого — двойник в NestJS
 * 3 — сегодня зал: охранник, хостес, официант
 */
const PHASES: MapPhase[] = [
  { full: false, tech: false },
  { full: true, tech: false },
  { full: true, tech: true },
  { full: true, tech: true, focus: 'hall' },
];

export function HallMapSlide({ step }: SlideProps) {
  return (
    <RestaurantMap
      step={step}
      phases={PHASES}
      title="Ресторан, только подробнее"
      captions={[
        'Помните ресторан: гость, официант, повар, склад',
        'В настоящем ресторане людей больше — и у каждого одна работа',
        'У каждого работника есть двойник в NestJS',
        'Сегодня — зал: кто пускает, кто ведёт к столу, кто принимает заказ',
      ]}
    />
  );
}
