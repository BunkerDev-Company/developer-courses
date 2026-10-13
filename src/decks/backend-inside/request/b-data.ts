import { DB_ROW, ENVELOPE_JSON, PRESENTED_JSON } from './data';

/**
 * Поля сквозного примера (data.ts), разобранные построчно, — чтобы слайды второй
 * половины раздела рисовали те же значения, что и первая, без копипасты.
 */
export interface Field {
  key: string;
  value: string;
}

/** Многострочный объект `{\n  key: value,\n … }` → список полей (ключи без кавычек). */
function fields(src: string): Field[] {
  return src
    .split('\n')
    .slice(1, -1)
    .map((line) => {
      const t = line.trim().replace(/,$/, '');
      const i = t.indexOf(':');
      return { key: t.slice(0, i).replace(/"/g, ''), value: t.slice(i + 1).trim() };
    });
}

/** Строка из БД: id, title, description, price, image_url, is_active, created_by, date_create_at, date_update_at. */
export const DB_FIELDS = fields(DB_ROW);

/** Результат presentItem: id, title, description, price, imageUrl, isActive, createdAt, updatedAt. */
export const API_FIELDS = fields(PRESENTED_JSON);

/** Конверт ResponseInterceptor: data, responseTime, core, endpoint, version. */
export const ENVELOPE_FIELDS = fields(ENVELOPE_JSON);

export function valueOf(list: Field[], key: string): string {
  return list.find((f) => f.key === key)?.value ?? '';
}
