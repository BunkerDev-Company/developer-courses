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
  outro:      { key: 'outro',      label: 'Итоги',         tone: 'success' },
};

export const STAGE_W = 1600;
export const STAGE_H = 900;
