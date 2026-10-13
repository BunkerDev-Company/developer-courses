/**
 * Цветовые «тоны» для инфографики. Классы выписаны строками целиком —
 * Tailwind JIT не видит динамические `bg-${tone}`, поэтому только через эту карту.
 */
export type Tone =
  | 'client'
  | 'guard'
  | 'ctrl'
  | 'logic'
  | 'prisma'
  | 'db'
  | 'git'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent'
  | 'muted';

interface ToneClasses {
  text: string;
  bg: string;
  soft: string;     // полупрозрачная подложка
  border: string;
  borderSoft: string;
  ring: string;     // свечение активного блока
  stroke: string;   // для SVG
  fill: string;     // для SVG
}

export const TONE: Record<Tone, ToneClasses> = {
  client: {
    text: 'text-client', bg: 'bg-client', soft: 'bg-client/10', border: 'border-client',
    borderSoft: 'border-client/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-client)/0.18)]',
    stroke: 'stroke-client', fill: 'fill-client',
  },
  guard: {
    text: 'text-guard', bg: 'bg-guard', soft: 'bg-guard/10', border: 'border-guard',
    borderSoft: 'border-guard/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-guard)/0.18)]',
    stroke: 'stroke-guard', fill: 'fill-guard',
  },
  ctrl: {
    text: 'text-ctrl', bg: 'bg-ctrl', soft: 'bg-ctrl/10', border: 'border-ctrl',
    borderSoft: 'border-ctrl/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-ctrl)/0.18)]',
    stroke: 'stroke-ctrl', fill: 'fill-ctrl',
  },
  logic: {
    text: 'text-logic', bg: 'bg-logic', soft: 'bg-logic/10', border: 'border-logic',
    borderSoft: 'border-logic/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-logic)/0.18)]',
    stroke: 'stroke-logic', fill: 'fill-logic',
  },
  prisma: {
    text: 'text-prisma', bg: 'bg-prisma', soft: 'bg-prisma/10', border: 'border-prisma',
    borderSoft: 'border-prisma/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-prisma)/0.18)]',
    stroke: 'stroke-prisma', fill: 'fill-prisma',
  },
  db: {
    text: 'text-db', bg: 'bg-db', soft: 'bg-db/10', border: 'border-db',
    borderSoft: 'border-db/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-db)/0.18)]',
    stroke: 'stroke-db', fill: 'fill-db',
  },
  git: {
    text: 'text-git', bg: 'bg-git', soft: 'bg-git/10', border: 'border-git',
    borderSoft: 'border-git/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-git)/0.18)]',
    stroke: 'stroke-git', fill: 'fill-git',
  },
  success: {
    text: 'text-success', bg: 'bg-success', soft: 'bg-success/10', border: 'border-success',
    borderSoft: 'border-success/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-success)/0.18)]',
    stroke: 'stroke-success', fill: 'fill-success',
  },
  warning: {
    text: 'text-warning', bg: 'bg-warning', soft: 'bg-warning/10', border: 'border-warning',
    borderSoft: 'border-warning/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-warning)/0.18)]',
    stroke: 'stroke-warning', fill: 'fill-warning',
  },
  danger: {
    text: 'text-danger', bg: 'bg-danger', soft: 'bg-danger/10', border: 'border-danger',
    borderSoft: 'border-danger/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-danger)/0.18)]',
    stroke: 'stroke-danger', fill: 'fill-danger',
  },
  accent: {
    text: 'text-accent', bg: 'bg-accent', soft: 'bg-accent/10', border: 'border-accent',
    borderSoft: 'border-accent/30', ring: 'shadow-[0_0_0_6px_rgb(var(--c-accent)/0.18)]',
    stroke: 'stroke-accent', fill: 'fill-accent',
  },
  muted: {
    text: 'text-muted', bg: 'bg-muted', soft: 'bg-surface-2', border: 'border-border-2',
    borderSoft: 'border-border', ring: 'shadow-none',
    stroke: 'stroke-muted', fill: 'fill-muted',
  },
};
