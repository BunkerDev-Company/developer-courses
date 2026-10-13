'use client';

import { motion } from 'framer-motion';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * По паре «метод Prisma ↔ SQL» на шаг. Код — из item-*.handler.ts etalon-backend.
 * 0 findMany · 1 findUnique · 2 create · 3 update · 4 deleteMany · 5 $transaction
 */

const PAIRS: { method: string; sqlWord: string; from: string; ts: string; sql: string }[] = [
  {
    method: 'findMany',
    sqlWord: 'SELECT',
    from: 'ListItemsHandler',
    ts: `await this.prisma.item.findMany({
  where: {
    is_active: true,
    title: { contains: 'чай', mode: 'insensitive' },
  },
  skip: 0,
  take: 20,
});`,
    sql: `SELECT id, title, price, …
FROM "Item"
WHERE is_active = $1
  AND title ILIKE $2  -- '%чай%'
LIMIT $3 OFFSET $4`,
  },
  {
    method: 'findUnique',
    sqlWord: 'SELECT … LIMIT 1',
    from: 'GetItemHandler',
    ts: `await this.prisma.item.findUnique({
  where: { id },
});`,
    sql: `SELECT id, title, price, …
FROM "Item"
WHERE id = $1
LIMIT 1`,
  },
  {
    method: 'create',
    sqlWord: 'INSERT',
    from: 'CreateItemHandler',
    ts: `await this.prisma.item.create({
  data: {
    title: 'Кружка',
    price: 350,
    created_by: command.creatorUserId,
  },
});`,
    sql: `INSERT INTO "Item" (title, price, created_by)
VALUES ($1, $2, $3)
RETURNING id, title, price, …`,
  },
  {
    method: 'update',
    sqlWord: 'UPDATE',
    from: 'UpdateItemHandler',
    ts: `await this.prisma.item.update({
  where: { id },
  data: { price: 390, date_update_at: new Date() },
});`,
    sql: `UPDATE "Item"
SET price = $1, date_update_at = $2
WHERE id = $3
RETURNING id, title, price, …`,
  },
  {
    method: 'deleteMany',
    sqlWord: 'DELETE',
    from: 'DeleteItemHandler',
    ts: `const { count } = await this.prisma.item.deleteMany({
  where: { id },
});
if (count === 0) this.errors.throw('ITEM_NOT_FOUND');`,
    sql: `DELETE FROM "Item"
WHERE id = $1
-- ответ базы: DELETE 1 → { count: 1 }`,
  },
  {
    method: '$transaction',
    sqlWord: 'BEGIN … COMMIT',
    from: 'ListItemsHandler',
    ts: `const [total, rows] = await this.prisma.$transaction([
  this.prisma.item.count({ where }),
  this.prisma.item.findMany({ where, skip, take }),
]);`,
    sql: `BEGIN;
SELECT COUNT(*) FROM "Item" WHERE …;
SELECT id, title, … FROM "Item" WHERE …
  LIMIT $1 OFFSET $2;
COMMIT;  -- ошибка? → ROLLBACK`,
  },
];

const RAIL_W = 228;
const RAIL_GAP = 14;
const PAIR_TOP = 128;
const TS_W = 700;
const SQL_X = 840;

export function QueriesSlide({ step }: SlideProps) {
  const p = PAIRS[step];

  return (
    <SlideLayout section="prisma" title="Методы Prisma ↔ SQL">
      {/* Рельс: все шесть методов, текущий подсвечен */}
      {PAIRS.map((it, i) => {
        const on = i === step;
        return (
          <motion.div
            key={it.method}
            initial={false}
            animate={{ opacity: i > step ? 0.35 : 1, scale: on ? 1.04 : 1 }}
            className={cn(
              'absolute flex flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-surface shadow-card transition-[border-color,box-shadow] duration-300',
              on ? cn(TONE.prisma.border, TONE.prisma.ring) : 'border-border',
            )}
            style={{ left: i * (RAIL_W + RAIL_GAP), top: 0, width: RAIL_W, height: 84 }}
          >
            <span className={cn('font-mono text-[21px] font-semibold', TONE.prisma.text)}>{it.method}</span>
            <span className={cn('font-mono text-[16px] font-medium', i <= step ? TONE.db.text : 'text-muted')}>{it.sqlWord}</span>
          </motion.div>
        );
      })}

      {/* Пара: TS слева, SQL справа */}
      <div className="absolute" style={{ left: 0, top: PAIR_TOP, width: TS_W }}>
        <Swap k={step}>
          <Code code={p.ts} lang="ts" size="sm" tone="logic" title={p.from} />
        </Swap>
      </div>
      <Arrow from={[TS_W + 10, PAIR_TOP + 110]} to={[SQL_X - 10, PAIR_TOP + 110]} tone="prisma" flow label="Prisma" labelOffset={[0, -34]} />
      <div className="absolute" style={{ left: SQL_X, top: PAIR_TOP, width: 1440 - SQL_X }}>
        <Swap k={step}>
          <Code code={p.sql} lang="sql" size="sm" tone="db" title="SQL" />
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="prisma"
        captions={[
          'findMany → SELECT с WHERE, LIMIT и OFFSET',
          'findUnique → SELECT по ключу, одна строка',
          'create → INSERT … RETURNING: сразу вернул строку',
          'update → UPDATE … SET … WHERE id',
          'deleteMany → DELETE, count — сколько строк удалено',
          '$transaction → BEGIN … COMMIT: всё или ничего',
        ]}
      />
    </SlideLayout>
  );
}
