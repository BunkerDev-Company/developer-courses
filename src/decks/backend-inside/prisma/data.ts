/**
 * Код для слайдов раздела Prisma. Всё — из etalon-backend
 * (item-*.handler.ts, schema.prisma, initial-schema-up.sql), местами укорочено.
 */

/* ── prisma-what: вызов из ListItemsHandler и SQL, который делает Prisma ── */

export const WHAT_TS = `await this.prisma.item.findMany({
  where, // { is_active: true }
  orderBy: { date_create_at: 'desc' },
  skip: (page - 1) * limit, // 0
  take: limit, // 20
});`;

export const WHAT_SQL = `SELECT id, title, price, …
FROM "Item"
WHERE is_active = $1
ORDER BY date_create_at DESC
LIMIT $2 OFFSET $3
-- $1 = true, $2 = 20, $3 = 0`;

export const WHAT_ROWS = `[
  { id: 'a1f3…', title: 'Кружка', … },
  { id: '7c02…', title: 'Футболка', … },
  { id: '4be9…', title: 'Блокнот', … },
]`;

export const ITEM_ROWS = [
  { id: 'a1f3…', title: 'Кружка', price: '350.00' },
  { id: '7c02…', title: 'Футболка', price: '1200.00' },
  { id: '4be9…', title: 'Блокнот', price: '180.00' },
];

/* ── prisma-flow: сквозной пример — колонка category из раздела «Миграции» ── */

export const FLOW_UP_SQL = `-- Категория товара
ALTER TABLE "Item" ADD COLUMN category VARCHAR(100);

CREATE INDEX idx_item_category ON "Item" (category);`;

export const FLOW_MODEL = `model Item {
  id          String   @id …
  title       String   @db.VarChar(255)
  // …
  category    String?  @db.VarChar(100)
}`;

/** Как TypeScript видит сгенерированный тип (в d.ts он собран из $ItemPayload). */
export const FLOW_TYPE = `export type Item = {
  id: string
  title: string
  // …
  category: string | null
}`;

/* ── prisma-pull: CREATE TABLE "Item" ↔ model Item ── */

export const PULL_SQL = `CREATE TABLE "Item" (
  id          UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  price       NUMERIC(12, 2) NOT NULL
    DEFAULT 0,
  created_by  UUID,
  -- … image_url, is_active, даты
  CONSTRAINT fk_item_created_by
    FOREIGN KEY (created_by)
    REFERENCES "User" (id)
);`;

export const PULL_MODEL = `model Item {
  id          String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title       String  @db.VarChar(255)
  description String?
  price       Decimal @default(0) @db.Decimal(12, 2)
  created_by  String? @db.Uuid
  // … image_url, is_active, даты
  User        User?   @relation(fields: [created_by], references: [id], …)
}`;

/* ── prisma-generate ── */

export const GEN_MODEL = `model Item {
  id          String   @id …
  title       String   @db.VarChar(255)
  description String?
  price       Decimal  @db.Decimal(12, 2)
  // …
}`;

export const GEN_TYPE_ITEM = `type Item = {
  id: string
  title: string
  description: string | null
  price: Prisma.Decimal
  // …
}`;

export const GEN_TYPE_CREATE = `type ItemCreateInput = {
  id?: string
  title: string
  description?: string | null
  price?: Decimal | number | string
  // …
}`;

/** 18 членов делегата prisma.item (сгенерированный ItemDelegate), по алфавиту. */
export const ITEM_DELEGATE_SHOWN = [
  'aggregate',
  'count',
  'create',
  'delete',
  'deleteMany',
  'findFirst',
  'findMany',
  'findUnique',
  'update',
  'upsert',
];
export const ITEM_DELEGATE_TOTAL = 18;
