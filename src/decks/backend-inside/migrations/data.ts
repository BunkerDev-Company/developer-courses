/**
 * Сквозной пример раздела: история миграций учебного проекта.
 * Первая — настоящая из etalon-backend, остальные — «следующие задачи».
 */
export const MIGRATIONS = [
  { name: '20260101000000_initial-schema', runOn: '10:02', title: 'User, Item, ErrorLog' },
  { name: '20260110093000_add-item-stock', runOn: '09:31', title: 'Item + stock' },
  { name: '20260115120000_add-item-category', runOn: '12:05', title: 'Item + category' },
  { name: '20260120150000_create-order', runOn: '15:12', title: 'новая таблица Order' },
] as const;

/** SQL сквозной миграции add-item-category. */
export const CATEGORY_UP = `-- Категория товара
ALTER TABLE "Item" ADD COLUMN category VARCHAR(100);

CREATE INDEX idx_item_category ON "Item" (category);`;

export const CATEGORY_DOWN = `-- Ровно обратное, в обратном порядке
DROP INDEX IF EXISTS idx_item_category;

ALTER TABLE "Item" DROP COLUMN IF EXISTS category;`;

/** Обёртка миграции — копия эталонной initial-schema.ts с другим именем. */
export const CATEGORY_WRAPPER = `import type { MigrationBuilder } from 'node-pg-migrate';
import { readFileSync } from 'fs';
import { join } from 'path';

const NAME = '20260115120000_add-item-category';
const sql = (direction: 'up' | 'down') =>
  readFileSync(join(process.cwd(), 'migrations', 'sqls', \`\${NAME}-\${direction}.sql\`), 'utf-8');

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(sql('up'));
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(sql('down'));
}`;
