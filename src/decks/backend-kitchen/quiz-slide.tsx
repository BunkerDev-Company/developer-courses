'use client';

import { M } from '@/components/ui/slide-layout';
import type { SlideProps } from '@/types';
import { REQ } from '../backend-inside/request/data';
import { Quiz, type QuizCase } from '../request/quiz';

// Тексты ошибок — дословно из @nestjs/cqrs, @nestjs/core и item-commands.handler.ts.
const CASES: QuizCase[] = [
  {
    request: 'POST /api/v1/items',
    note: 'после правки app.module',
    symptom: '500 · code 99, в консоли:\nNo handler found for the command: "CreateItemCommand".',
    role: 'pass',
    culprit: 'CommandHandlers',
    why: 'повара не записали на раздачу — чек некому отдать',
  },
  {
    request: 'npm run start:dev',
    note: 'бэкенд не запускается',
    symptom: "Nest can't resolve dependencies of the\nCreateItemHandler (PrismaService, ErrorService, ?)",
    role: 'tools',
    culprit: 'providers',
    why: 'NotificationService убрали из providers — подать нечего',
  },
  {
    request: 'POST /api/v1/items',
    note: '"price": -5',
    symptom: '400 · code 5\ndetails: "Цена должна быть числом >= 0"',
    role: 'cook',
    culprit: 'validate()',
    why: 'не поломка: правило магазина сработало как надо',
  },
  {
    request: `GET /api/v1/items/${REQ.itemId.slice(0, 4)}…`,
    note: 'на фронте нет картинки',
    symptom: '"data": { …, "image_url": "…/uploads/…",\n          "created_by": "8b1e…" }',
    role: 'plate',
    culprit: 'presentItem',
    why: 'вернули строку БД как есть — забыли presenter',
  },
];

export function KitchenQuizSlide({ step }: SlideProps) {
  return (
    <Quiz
      step={step}
      title="Где сломалось на кухне?"
      cases={CASES}
      captions={[
        'Симптом → кто на кухне виноват? Сначала угадываем',
        'No handler found — раздача не знает повара: строка в app.module',
        <>
          can&apos;t resolve dependencies — технику не поставили: <M>providers</M>
        </>,
        'Иногда 400 — это не баг: повар проверил цену и отказал',
        <>
          snake_case в ответе — хендлер вернул строку БД без <M>presentItem</M>
        </>,
      ]}
    />
  );
}
