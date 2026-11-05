import type { LucideIcon } from 'lucide-react';
import {
  Bug,
  CodeXml,
  Compass,
  Crown,
  FileSearch,
  GraduationCap,
  HeartHandshake,
  Palette,
  Rocket,
  ServerCog,
  Target,
  Users,
} from 'lucide-react';
import type { Tone } from '@/lib/tones';

/**
 * Сквозной пример лекции: команда «Корзина» того же интернет-магазина, что в «Что такое бэкенд»,
 * делает задачу «Промокод в корзине». Одни и те же люди и роли на всех слайдах.
 */

export type RoleKey =
  | 'ceo'
  | 'cto'
  | 'cpo'
  | 'hr'
  | 'pm'
  | 'analyst'
  | 'design'
  | 'dev'
  | 'qa'
  | 'devops'
  | 'lead'
  | 'intern';

export interface Role {
  name: string;
  /** Короткая подпись рядом с именем в чате и на схемах: «продакт», «QA». */
  tag: string;
  /** Цвет роли — один на всех слайдах. Синий — бизнес и продукт, фиолетовый — техника. */
  tone: Tone;
  icon: LucideIcon;
}

export const ROLES: Record<RoleKey, Role> = {
  ceo:     { name: 'Генеральный директор', tag: 'CEO', tone: 'client', icon: Crown },
  cto:     { name: 'Технический директор', tag: 'CTO', tone: 'logic', icon: ServerCog },
  cpo:     { name: 'Директор по продукту', tag: 'CPO', tone: 'ctrl', icon: Compass },
  hr:      { name: 'HR', tag: 'HR', tone: 'guard', icon: HeartHandshake },
  pm:      { name: 'Продакт-менеджер', tag: 'продакт', tone: 'ctrl', icon: Target },
  analyst: { name: 'Аналитик', tag: 'аналитик', tone: 'prisma', icon: FileSearch },
  design:  { name: 'Дизайнер', tag: 'дизайнер', tone: 'db', icon: Palette },
  dev:     { name: 'Разработчик', tag: 'разработчик', tone: 'logic', icon: CodeXml },
  qa:      { name: 'Тестировщик', tag: 'QA', tone: 'success', icon: Bug },
  devops:  { name: 'DevOps', tag: 'DevOps', tone: 'client', icon: Rocket },
  lead:    { name: 'Тимлид', tag: 'тимлид', tone: 'git', icon: Users },
  intern:  { name: 'Стажёр', tag: 'стажёр', tone: 'accent', icon: GraduationCap },
};

/** Люди команды «Корзина». */
export const PEOPLE = {
  lead: { name: 'Анна', role: 'lead' },
  pm: { name: 'Олег', role: 'pm' },
  analyst: { name: 'Ира', role: 'analyst' },
  design: { name: 'Даша', role: 'design' },
  dev: { name: 'Макс', role: 'dev' },
  front: { name: 'Ян', role: 'dev' },
  qa: { name: 'Лена', role: 'qa' },
  hr: { name: 'Катя', role: 'hr' },
  you: { name: 'Вы', role: 'intern' },
} as const satisfies Record<string, { name: string; role: RoleKey }>;

/** Задача, которая идёт через все слайды. */
export const TASK = { key: 'PROMO-12', title: 'Промокод в корзине' } as const;

/* ── Чат первого дня и словарик к нему ───────────────────────────────── */

export type TermGroup = 'meetings' | 'work' | 'talk';

export const TERM_GROUPS: Record<TermGroup, { title: string; tone: Tone }> = {
  meetings: { title: 'Встречи', tone: 'prisma' },
  work: { title: 'Задачи и код', tone: 'logic' },
  talk: { title: 'Общение', tone: 'git' },
};

export type TermKey = 'daily' | 'planning' | 'oneOnOne' | 'task' | 'pr' | 'bug' | 'blocker' | 'ping' | 'onboarding';

export const TERMS: Record<TermKey, { word: string; meaning: string; group: TermGroup }> = {
  daily:      { word: 'дейли', meaning: 'каждый день, 15 минут, вся команда', group: 'meetings' },
  planning:   { word: 'планнинг', meaning: 'начало спринта: что берём в работу', group: 'meetings' },
  oneOnOne:   { word: '1:1', meaning: 'личная встреча с тимлидом', group: 'meetings' },
  task:       { word: 'таска, тикет', meaning: 'задача в трекере: Jira, YouTrack…', group: 'work' },
  pr:         { word: 'ПР', meaning: 'pull request: «проверьте мой код»', group: 'work' },
  bug:        { word: 'баг', meaning: 'ошибка в программе', group: 'work' },
  blocker:    { word: 'блокер', meaning: 'то, из-за чего вы застряли', group: 'talk' },
  ping:       { word: 'пингануть', meaning: 'написать, упомянуть в чате', group: 'talk' },
  onboarding: { word: 'онбординг', meaning: 'первые недели: доступы, знакомства', group: 'talk' },
};

export type ChatPart = string | { text: string; term: TermKey };

export interface ChatMsg {
  who: string;
  role: RoleKey;
  time: string;
  parts: ChatPart[];
}

export const CHAT: ChatMsg[] = [
  { who: PEOPLE.lead.name, role: 'lead', time: '17:02', parts: ['Привет! Завтра в 10:30 ', { text: 'дейли', term: 'daily' }, ', не опаздывай'] },
  { who: PEOPLE.pm.name, role: 'pm', time: '17:05', parts: ['После ', { text: 'планнинга', term: 'planning' }, ' заведу ', { text: 'таски', term: 'task' }, ' на промокоды'] },
  { who: PEOPLE.analyst.name, role: 'analyst', time: '17:06', parts: ['Требования — в ', { text: 'тикете', term: 'task' }, ' PROMO-12'] },
  {
    who: PEOPLE.dev.name,
    role: 'dev',
    time: '17:11',
    parts: ['Кидай ', { text: 'ПР', term: 'pr' }, ', посмотрю. Будет ', { text: 'блокер', term: 'blocker' }, ' — ', { text: 'пингуй', term: 'ping' }],
  },
  { who: PEOPLE.qa.name, role: 'qa', time: '17:20', parts: ['Нашла ', { text: 'баг', term: 'bug' }, ' в корзине, вернула в работу'] },
  {
    who: PEOPLE.hr.name,
    role: 'hr',
    time: '17:34',
    parts: ['Пройди ', { text: 'онбординг', term: 'onboarding' }, ' и запишись на ', { text: '1:1', term: 'oneOnOne' }, ' с Анной'],
  },
];
