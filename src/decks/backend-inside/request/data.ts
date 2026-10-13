/**
 * Сквозной пример раздела «Путь запроса»: админ создаёт товар.
 * POST /api/v1/items → ItemsController.create → CreateItemCommand → CreateItemHandler.
 * Значения одинаковые на всех слайдах раздела — студенты следят за одним и тем же запросом.
 */

export const REQ = {
  method: 'POST',
  path: '/api/v1/items',
  token: 'eyJhbGciOiJIUzI1NiIs…',
  body: { title: 'Наушники', price: 1990 },
  userId: '8b1e4c2a-…',
  itemId: '3f2a9d10-…',
  createdAt: '2026-01-15T12:30:00.000Z',
  responseTime: 12,
} as const;

/** Тело запроса как его видит сервер. */
export const BODY_JSON = `{ "title": "Наушники", "price": 1990 }`;

/** Сырой HTTP-запрос, который отправляет axios из etalon-frontend. */
export const HTTP_REQUEST = `POST /api/v1/items HTTP/1.1
Host: localhost:3000
Authorization: Bearer ${REQ.token}
Content-Type: application/json

${BODY_JSON}`;

/** Строка, которую вернула Prisma после INSERT (snake_case, Decimal). */
export const DB_ROW = `{
  id: "${REQ.itemId}",
  title: "Наушники",
  description: null,
  price: Decimal("1990.00"),
  image_url: null,
  is_active: true,
  created_by: "${REQ.userId}",
  date_create_at: 2026-01-15T12:30:00.000Z,
  date_update_at: 2026-01-15T12:30:00.000Z
}`;

/** Результат presentItem(item): camelCase, number, без служебных полей. */
export const PRESENTED_JSON = `{
  "id": "${REQ.itemId}",
  "title": "Наушники",
  "description": null,
  "price": 1990,
  "imageUrl": null,
  "isActive": true,
  "createdAt": "${REQ.createdAt}",
  "updatedAt": "${REQ.createdAt}"
}`;

/** Что реально уходит клиенту: конверт ResponseInterceptor. */
export const ENVELOPE_JSON = `{
  "data": { "id": "${REQ.itemId}", "title": "Наушники", "price": 1990, … },
  "responseTime": ${REQ.responseTime},
  "core": "1.0.0",
  "endpoint": "/api/v1/items",
  "version": "0.1.0, local"
}`;
