'use client';

import { Package } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { DataTable, type DataRow } from '@/components/ui/data-table';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { Console } from '../parts';

/**
 * Шаги:
 * 0 — до миграции: демо-товары эталона с ценами
 * 1 — up: товар становится игровым предметом, колонку price удалили
 * 2 — down: колонка вернулась, но цены — 0
 * 3 — вывод и демо из README: DROP COLUMN на проде — только осознанно, сначала бэкап
 */

// migrations/sqls/20261001120200_items-become-loot-up.sql — выдержка.
const UP_SQL = `ALTER TABLE "Item"
    ADD COLUMN code   VARCHAR(50),
    ADD COLUMN stat   VARCHAR(20),
    ADD COLUMN rarity VARCHAR(10)   NOT NULL DEFAULT 'common',
    ADD COLUMN value  NUMERIC(6, 2) NOT NULL DEFAULT 0;
…
-- Цена предметам больше не нужна: их не покупают, а выбирают из трёх.
ALTER TABLE "Item" DROP CONSTRAINT chk_item_price;
ALTER TABLE "Item" DROP COLUMN price;`;

// …-down.sql — начало файла дословно, комментарий перенесён по ширине.
const DOWN_SQL = `-- УРОК: down возвращает СТРУКТУРУ, но не всегда ДАННЫЕ.
-- Колонка price вернётся, но цены, которые были до up,
-- потеряны навсегда (будет 0).
ALTER TABLE "Item" ADD COLUMN price NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE "Item" ADD CONSTRAINT chk_item_price CHECK (price >= 0);`;

// Демо-товары из seed эталона (etalon-backend/scripts/seed.ts).
const ITEMS = [
  { key: 'd1', title: 'Демо-товар 1', price: '990.00' },
  { key: 'd2', title: 'Демо-товар 2', price: '1990.00' },
];

function table(step: number): { columns: string[]; grid: string; rows: DataRow[] } {
  if (step === 1) {
    return {
      columns: ['title', 'code', 'is_active'],
      grid: '1fr 170px 110px',
      rows: ITEMS.map((it, i) => ({ key: it.key, cells: [it.title, `legacy_${i ? '5b07…' : '8c1f…'}`, 'FALSE'], state: 'hl' })),
    };
  }
  const lost = step >= 2;
  return {
    columns: ['title', 'price'],
    grid: '1fr 150px',
    rows: ITEMS.map((it) => ({
      key: it.key,
      cells: [it.title, lost ? <span key="p" className="font-semibold text-danger">0.00</span> : it.price],
      state: lost ? 'removed' : 'normal',
    })),
  };
}

export function LootSlide({ step }: SlideProps) {
  const t = table(step);
  return (
    <SlideLayout section="migrations" title="down вернёт структуру, но не данные">
      <div className="absolute" style={{ left: 0, top: 0, width: 860 }}>
        <Swap k={step < 2 ? 'up' : 'down'}>
          {step < 2 ? (
            <Code code={UP_SQL} lang="sql" size="sm" title="…_items-become-loot-up.sql" hl={step === 1 ? [1, 2, 3, 4, 5, 8, 9] : undefined} tone="git" />
          ) : (
            <Code code={DOWN_SQL} lang="sql" size="sm" title="…_items-become-loot-down.sql" hl={step === 2 ? [4, 5] : [1, 2, 3]} tone="danger" />
          )}
        </Swap>
      </div>

      <DataTable
        title={'"Item"'}
        icon={Package}
        tone="db"
        columns={t.columns}
        grid={t.grid}
        rows={t.rows}
        className="absolute"
        style={{ left: 900, top: 0, width: 540 }}
      />

      <div className="absolute" style={{ left: 0, top: 360, width: 1440 }}>
        <Swap k={step === 3 ? 'demo' : 'none'}>
          {step === 3 && (
            <Console
              title="демо из migrations/README.md: down с потерей данных"
              lines={[
                { text: '$ npx node-pg-migrate --migrations-dir "migrations/*.ts" --use-glob --ts-node down 7', kind: 'out' },
                { text: '# SELECT title, price FROM "Item";  -> price = 0', kind: 'dim' },
                { text: '$ npm run migrate:up', kind: 'out' },
              ]}
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step >= 2 ? 'danger' : 'git'}
        captions={[
          'До миграции: в Item — демо-товары эталона с ценами',
          <>
            up: товар стал игровым предметом, колонку <M>price</M> удалили
          </>,
          'down: колонка вернулась — а цены нет, у всех 0',
          'down вернёт структуру, но не данные. DROP на проде — сначала бэкап',
        ]}
      />
    </SlideLayout>
  );
}
