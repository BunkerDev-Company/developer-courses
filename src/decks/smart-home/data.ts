import type { Tone } from '@/lib/tones';

/**
 * Сквозной пример лекции: один Wi-Fi-чайник через все слайды.
 * Схема топиков — наша (по образцу Zigbee2MQTT: состояние / команда / онлайн).
 */
export const KETTLE_ID = 'kettle-1';

export const TOPIC = {
  state: `dev/${KETTLE_ID}/state`,
  set: `dev/${KETTLE_ID}/set`,
  availability: `dev/${KETTLE_ID}/availability`,
} as const;

/** Что чайник публикует о себе (поля — как в эмуляторе на слайде «Попробуйте сами»). */
export const STATE_JSON = '{ "power": "on", "temperature": 63, "target": 90 }';
/** Команда «вскипяти до 90°». */
export const SET_JSON = '{ "power": "on", "target": 90 }';

/** Тоны «слоёв» умного дома — одни и те же на всех слайдах лекции. */
export const T = {
  app: 'client',
  device: 'warning',
  net: 'muted',
  broker: 'prisma',
  backend: 'logic',
  db: 'db',
} as const satisfies Record<string, Tone>;

/**
 * Реальный вывод `npx mqtt sub -t 'dev/#' -v` (mqtt.js 5.16): эмулятор со слайда «Попробуйте сами»,
 * брокер на localhost:1883, команда отправлена `npx mqtt pub -t dev/kettle-1/set -m '{"power":"on","target":90}' -q 1`.
 * Повторяющиеся строки «до команды» сокращены до одной.
 */
export const SUB_OUTPUT = [
  'dev/kettle-1/availability online',
  'dev/kettle-1/state {"power":"off","temperature":20,"target":100}',
  'dev/kettle-1/set {"power":"on","target":90}',
  'dev/kettle-1/state {"power":"on","temperature":30,"target":90}',
  'dev/kettle-1/state {"power":"on","temperature":40,"target":90}',
  'dev/kettle-1/state {"power":"on","temperature":50,"target":90}',
  'dev/kettle-1/state {"power":"on","temperature":60,"target":90}',
  'dev/kettle-1/state {"power":"on","temperature":70,"target":90}',
  'dev/kettle-1/state {"power":"on","temperature":80,"target":90}',
  'dev/kettle-1/state {"power":"off","temperature":90,"target":90}',
];
