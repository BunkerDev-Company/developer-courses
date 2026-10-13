import type { LucideIcon } from 'lucide-react';
import { Backpack, Coffee, Footprints, Headphones } from 'lucide-react';
import type { Tone } from '@/lib/tones';

/** Товары учебного магазина — те же поля, что у Item в etalon-frontend (title, price в рублях). */
export interface Product {
  id: string;
  title: string;
  price: number;
  icon: LucideIcon;
  tone: Tone;
}

export const PRODUCTS: Product[] = [
  { id: 'sneakers', title: 'Кроссовки', price: 4990, icon: Footprints, tone: 'git' },
  { id: 'backpack', title: 'Рюкзак', price: 2490, icon: Backpack, tone: 'prisma' },
  { id: 'headphones', title: 'Наушники', price: 3290, icon: Headphones, tone: 'accent' },
  { id: 'mug', title: 'Термокружка', price: 890, icon: Coffee, tone: 'warning' },
];

/** 4990 → «4 990 ₽» (неразрывные пробелы; без Intl — одинаково на сервере и в браузере). */
export function money(n: number): string {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;
}

/** Цвета трёх «слоёв» фронтенда — одинаковые на всех слайдах этой презентации. */
export const LAYER_TONE = { html: 'git', css: 'db', js: 'warning' } as const satisfies Record<string, Tone>;
