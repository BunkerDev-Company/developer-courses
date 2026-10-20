/**
 * Сквозной пример презентации — игра «Подземелье» (dungeon-backend).
 * Код на слайдах — дословные выдержки из ../dungeon-backend (сокращения — «…»).
 * Значения примера одинаковые на всех слайдах: игрок Hero покупает «Силу» 3-го уровня.
 */

export const EX = {
  nickname: 'Hero',
  userId: '5c1d07e2-…',
  runId: 'a3f0b6c1-…',
  chestId: '9e47d2aa-…',
  upgrade: 'might',
  upgradeTitle: 'Сила',
  level: 3,
  /** upgradePrice('might', 3) = round(30 × 3^1.3). */
  price: 125,
  /** upgradePrice('might', 4). */
  nextPrice: 182,
  balanceBefore: 300,
  balanceAfter: 175,
} as const;

/** migrations/20261001120500_chests.ts — обёртка, одинаковая у всех миграций. */
export const MIGRATION_WRAPPER = `const sql = (direction: 'up' | 'down') =>
  readFileSync(join(process.cwd(), 'migrations', 'sqls',
    \`20261001120500_chests-\${direction}.sql\`), 'utf-8');

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(sql('up'));
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(sql('down'));
}`;

/** Все миграции игры по порядку. stage — этап игры, lesson — урок из migrations/README.md. */
export const HISTORY: { name: string; stage: 1 | 2; lesson: string }[] = [
  { name: '20260101000000_initial-schema', stage: 1, lesson: 'старт из эталона' },
  { name: '20261001120000_user-nickname', stage: 1, lesson: 'NOT NULL в таблицу со строками' },
  { name: '20261001120100_wallet', stage: 1, lesson: 'деньги защищает база' },
  { name: '20261001120200_items-become-loot', stage: 1, lesson: 'down не вернёт данные' },
  { name: '20261001120300_item-catalog', stage: 1, lesson: 'миграция данных' },
  { name: '20261001120400_runs', stage: 1, lesson: 'частичный уникальный индекс' },
  { name: '20261001120500_chests', stage: 1, lesson: 'сущность и событие — разные таблицы' },
  { name: '20261001120600_player-upgrades', stage: 1, lesson: 'составной первичный ключ' },
  { name: '20261001120700_run-active-index-fix', stage: 1, lesson: 'применённую не правят' },
  { name: '20261015100000_locations-v2', stage: 2, lesson: 'CHECK — только DROP + ADD' },
  { name: '20261015100100_coop-run-players', stage: 2, lesson: 'перенос данных между таблицами' },
  { name: '20261015100200_item-catalog-v2', stage: 2, lesson: 'JSONB для разной формы' },
  { name: '20261015100300_settings-and-admin-log', stage: 2, lesson: 'журнал только на INSERT' },
  { name: '20261015110000_item-catalog-100', stage: 2, lesson: 'справочник генерируется из кода' },
  { name: '20261015183426_heroes-party8-shop30', stage: 2, lesson: 'расширение диапазона CHECK' },
];
