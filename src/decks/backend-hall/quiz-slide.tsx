'use client';

import { M } from '@/components/ui/slide-layout';
import type { SlideProps } from '@/types';
import { Quiz, type QuizCase } from '../request/quiz';

// Ответы — реальные ответы etalon-backend (через GlobalExceptionFilter), служебные поля конверта опущены.
const CASES: QuizCase[] = [
  {
    request: 'POST /api/v1/items',
    note: 'без заголовка Authorization',
    symptom: '401 · code 1 · "Unauthorized"',
    role: 'guard',
    culprit: 'JwtAuthGuard',
    why: 'нет пропуска — дальше входа не пустили',
  },
  {
    request: 'POST /api/v1/items',
    note: 'токен обычного пользователя',
    symptom: '403 · code 41 · "Role Forbidden"',
    role: 'guard',
    culprit: 'RolesGuard',
    why: 'пропуск есть, но сюда — только admin',
  },
  {
    request: 'POST /api/v1/item',
    note: 'опечатка в адресе',
    symptom: '404 · "Cannot POST /api/v1/item"',
    role: 'host',
    culprit: 'таблица маршрутов',
    why: 'такого адреса в таблице нет — вести некуда',
  },
  {
    request: 'GET /api/v1/items/abc',
    note: 'id — не UUID',
    symptom: '400 · "Validation failed (uuid is expected)"',
    role: 'waiter',
    culprit: 'ParseUUIDPipe',
    why: 'pipe отклонил id — метод даже не вызвали',
  },
];

export function HallQuizSlide({ step }: SlideProps) {
  return (
    <Quiz
      step={step}
      title="Где сломалось?"
      cases={CASES}
      captions={[
        'Симптом → какой работник зала остановил запрос? Сначала угадываем',
        'Нет токена — охранник на входе: JwtAuthGuard, 401',
        'Роль не та — второй охранник: RolesGuard, 403',
        'Адреса нет в таблице маршрутов — 404, контроллер даже не узнал',
        <>
          <M>abc</M> — не UUID: <M>ParseUUIDPipe</M> ответил 400 до вызова метода
        </>,
      ]}
    />
  );
}
