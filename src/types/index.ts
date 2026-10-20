import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Tone } from '@/lib/tones';

/** Пропсы любого слайда: номер текущего шага (0 … steps-1). */
export interface SlideProps {
  step: number;
}

export type SectionKey =
  | 'intro'
  | 'web'
  | 'frontend'
  | 'backend'
  | 'migrations'
  | 'prisma'
  | 'request'
  | 'game'
  | 'realtime'
  | 'devices'
  | 'protocols'
  | 'home'
  | 'outro';

export interface SectionDef {
  key: SectionKey;
  label: string;
  tone: Tone;
}

export interface SlideDef {
  /** Уникальный в пределах презентации slug: 'mig-runner'. */
  id: string;
  section: SectionKey;
  /** Короткое имя — для оглавления, шапки и заметок. */
  title: string;
  /** Сколько шагов (кликов) внутри слайда. Минимум 1. */
  steps: number;
  Component: ComponentType<SlideProps>;
  /** Тезисы лектору (клавиша N). Студенты их не видят, пока не нажать. */
  notes?: string[];
}

/** Папка на главной: группа презентаций одной темы. */
export interface FolderDef {
  id: string;
  title: string;
  description: string;
  tone: Tone;
  icon: LucideIcon;
}

/** Презентация целиком: карточка на главной + слайды. */
export interface DeckDef {
  /** Часть адреса: /p/<id>. */
  id: string;
  folder: string;
  title: string;
  /** Суть в 1–2 предложениях — показывается при выборе на главной. */
  description: string;
  /** О чём по пунктам — список в карточке. */
  topics: string[];
  /** Примерная длительность: «20 мин». */
  duration: string;
  /** Уровень: «с нуля», «нужны основы»… */
  level: string;
  tone: Tone;
  icon: LucideIcon;
  slides: SlideDef[];
}
