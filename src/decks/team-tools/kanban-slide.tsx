'use client';

import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { SPRING } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';

/**
 * Kanban-доска. 0 без лимитов: шесть задач «в работе», ничего не готово →
 * 1 лимит WIP: больше трёх нельзя → 2 лишние вернулись в очередь → 3 поток пошёл, время цикла.
 */

const COLUMNS: { title: string; limit?: number }[] = [
  { title: 'Очередь' },
  { title: 'В работе', limit: 3 },
  { title: 'Ревью', limit: 2 },
  { title: 'Готово' },
];

const TASKS = [
  { key: 'PROMO-12', title: 'Промокод в корзине' },
  { key: 'SHOP-28', title: 'Фильтр по цене' },
  { key: 'SHOP-31', title: 'Оплата частями' },
  { key: 'SHOP-35', title: 'Тёмная тема' },
  { key: 'SHOP-22', title: 'Ускорить каталог' },
  { key: 'SHOP-19', title: 'Отзывы о товаре' },
  { key: 'SHOP-17', title: 'Письмо о заказе' },
  { key: 'SHOP-11', title: 'Избранное' },
];

/** Где каждая задача на шаге: [колонка, место]. Порядок — как в TASKS. */
const PLACES: [number, number][][] = [
  [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [0, 0], [0, 1]],
  [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [0, 0], [0, 1]],
  [[1, 0], [1, 1], [1, 2], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  [[3, 0], [3, 1], [2, 0], [2, 1], [1, 0], [1, 1], [0, 0], [0, 1]],
];

const COL_W = 340;
const COL_GAP = (1440 - 4 * COL_W) / 3;
const colX = (i: number) => i * (COL_W + COL_GAP);
const COL_H = 486;
const SLOT_TOP = 66;
const CARD_H = 62;
const SLOT = CARD_H + 8;

export function KanbanSlide({ step }: SlideProps) {
  const places = PLACES[step];
  const limits = step >= 1;
  const overflow = step === 1;

  return (
    <SlideLayout section="kanban" title="Kanban: поток и лимит WIP">
      {COLUMNS.map((c, i) => {
        const bad = overflow && i === 1;
        return (
          <div
            key={c.title}
            className={cn(
              'absolute rounded-2xl border-2 bg-surface-2 transition-[border-color,box-shadow] duration-300',
              bad ? cn(TONE.danger.border, TONE.danger.ring) : 'border-border',
            )}
            style={{ left: colX(i), top: 0, width: COL_W, height: COL_H }}
          >
            <div className="flex items-center gap-3 px-4" style={{ height: 58 }}>
              <span className="text-[24px] font-bold">{c.title}</span>
              {c.limit && (
                <Reveal show={limits} from="scale" className="ml-auto">
                  <Pill tone={bad ? 'danger' : 'prisma'} solid={bad}>
                    ≤ {c.limit}
                  </Pill>
                </Reveal>
              )}
            </div>
          </div>
        );
      })}

      {TASKS.map((t, i) => {
        const [col, slot] = places[i];
        const over = overflow && col === 1 && slot >= 3;
        return (
          <motion.div
            key={t.key}
            className={cn(
              'absolute flex flex-col justify-center rounded-xl border-2 px-3 shadow-card transition-colors duration-300',
              over ? 'border-danger bg-danger/10' : col === 3 ? 'border-success/60 bg-surface' : 'border-border bg-surface',
            )}
            style={{ left: 0, top: 0, width: COL_W - 20, height: CARD_H }}
            initial={false}
            animate={{ x: colX(col) + 10, y: SLOT_TOP + slot * SLOT }}
            transition={SPRING}
          >
            <span className={cn('font-mono text-[15px] leading-tight', t.key === 'PROMO-12' ? 'text-accent' : 'text-muted')}>{t.key}</span>
            <span className="truncate text-[20px] font-semibold leading-tight">{t.title}</span>
          </motion.div>
        );
      })}

      <Reveal show={step >= 3} from="up" className="absolute" style={{ left: colX(3) + 10, top: SLOT_TOP + 2 * SLOT + 12, width: COL_W - 20 }}>
        <div className="flex items-center gap-3 rounded-xl border-2 border-prisma/30 bg-prisma/10 px-4 py-3">
          <Timer size={28} className="shrink-0 text-prisma" />
          <div>
            <div className="text-[22px] font-bold leading-tight text-prisma">время цикла ≈ 3 дня</div>
            <div className="text-[17px] leading-snug text-text-2">от «в работе» до «готово»</div>
          </div>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 1 ? 'danger' : step === 3 ? 'success' : 'prisma'}
        captions={[
          'Без лимита: всё начато, ничего не готово',
          'Лимит WIP: в работе одновременно не больше трёх задач',
          'Лишнее — обратно в очередь. Сначала доделай, потом бери новое',
          'Задачи доходят до конца. Главная метрика — время цикла',
        ]}
      />
    </SlideLayout>
  );
}
