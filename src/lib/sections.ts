import type { SectionDef, SectionKey } from '@/types';

/** Разделы общие для всех презентаций: метка над заголовком и цвет полосы прогресса. */
export const SECTIONS: Record<SectionKey, SectionDef> = {
  intro:      { key: 'intro',      label: 'Введение',      tone: 'accent' },
  web:        { key: 'web',        label: 'Как устроен веб', tone: 'db' },
  frontend:   { key: 'frontend',   label: 'Фронтенд',      tone: 'accent' },
  backend:    { key: 'backend',    label: 'Бэкенд',        tone: 'logic' },
  migrations: { key: 'migrations', label: 'Миграции',      tone: 'git' },
  prisma:     { key: 'prisma',     label: 'Prisma',        tone: 'prisma' },
  request:    { key: 'request',    label: 'Путь запроса',  tone: 'ctrl' },
  game:       { key: 'game',       label: 'Игра',          tone: 'accent' },
  realtime:   { key: 'realtime',   label: 'Реальное время', tone: 'logic' },
  devices:    { key: 'devices',    label: 'Устройство',    tone: 'warning' },
  protocols:  { key: 'protocols',  label: 'Связь',         tone: 'prisma' },
  home:       { key: 'home',       label: 'Умный дом',     tone: 'success' },
  company:    { key: 'company',    label: 'Компания',      tone: 'accent' },
  team:       { key: 'team',       label: 'Команда',       tone: 'git' },
  meetings:   { key: 'meetings',   label: 'Встречи',       tone: 'prisma' },
  culture:    { key: 'culture',    label: 'Культура',      tone: 'guard' },
  hiring:     { key: 'hiring',     label: 'Как попасть',   tone: 'guard' },
  internship: { key: 'internship', label: 'Стажировка',    tone: 'warning' },
  grades:     { key: 'grades',     label: 'Грейды',        tone: 'logic' },
  growth:     { key: 'growth',     label: 'Развитие',      tone: 'git' },
  agile:      { key: 'agile',      label: 'Agile',         tone: 'accent' },
  scrum:      { key: 'scrum',      label: 'Scrum',         tone: 'ctrl' },
  kanban:     { key: 'kanban',     label: 'Kanban',        tone: 'prisma' },
  task:       { key: 'task',       label: 'Задача',        tone: 'guard' },
  code:       { key: 'code',       label: 'Код в команде', tone: 'git' },
  outro:      { key: 'outro',      label: 'Итоги',         tone: 'success' },
};

export const STAGE_W = 1600;
export const STAGE_H = 900;
