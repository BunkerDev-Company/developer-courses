'use client';

import { GitCommitHorizontal, Laptop, Server, X } from 'lucide-react';
import type { SchemaColumn } from '@/components/ui/schema-card';
import { highlight, TOKEN_CLASS, type Lang } from '@/lib/highlight';
import { cn } from '@/lib/utils';

/**
 * Общая раскладка слайдов mig-problem и mig-idea: три машины (Вася, Петя, прод)
 * в колонках, сверху — коммит, между ними — стрелки гита.
 * Координаты — в области контента 1440×640.
 */

export const COL_W = 433;

export const MACHINES = [
  { key: 'vasya', name: 'Ноутбук Васи', icon: Laptop, x: 0 },
  { key: 'petya', name: 'Ноутбук Пети', icon: Laptop, x: 503 },
  { key: 'prod', name: 'Прод-сервер', icon: Server, x: 1007 },
] as const;

/** Вертикаль колонки: шапка машины → панель (код/терминал) → таблица Item. */
export const ROW = { head: 140, slot: 204, schema: 312 } as const;
export const SLOT_H = 92;

/** Коммит сверху по центру. */
export const COMMIT = { x: 400, y: 0, w: 640, h: 64 } as const;

/** Стрелки гита: Вася → коммит → Петя / прод. */
export const GIT_ARROWS = {
  push: { from: [330, 136], to: [394, 40], label: 'git push', offset: [-4, 4] },
  pull: { from: [720, 68], to: [720, 136], label: 'git pull', offset: [78, 0] },
  deploy: { from: [1046, 40], to: [1150, 136], label: 'деплой', offset: [12, -8] },
} as const;

/** Item до миграции add-item-category — как на слайде mig-runner. */
export const ITEM_BASE: SchemaColumn[] = [
  { name: 'id', type: 'UUID', pk: true },
  { name: 'title', type: 'VARCHAR(255)' },
  { name: 'price', type: 'NUMERIC(12,2)' },
  { name: 'stock', type: 'INT' },
];

export const CATEGORY_COL = { name: 'category', type: 'VARCHAR(100)' } as const;

/** Шапка колонки: иконка машины + имя, справа — статус. */
export function MachineHead({
  index,
  dim,
  children,
}: {
  index: 0 | 1 | 2;
  dim?: boolean;
  children?: React.ReactNode;
}) {
  const m = MACHINES[index];
  const Icon = m.icon;
  return (
    <div
      className={cn('absolute flex items-center gap-3 transition-opacity duration-300', dim && 'opacity-35')}
      style={{ left: m.x, top: ROW.head, width: COL_W, height: 40 }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-text-2">
        <Icon size={24} strokeWidth={2} />
      </div>
      <span className="whitespace-nowrap text-[26px] font-semibold">{m.name}</span>
      <span className="ml-auto">{children}</span>
    </div>
  );
}

export interface PanelLine {
  text: string;
  /** code — подсветка по lang; cmd — команда с `$`; ok/err — результат. */
  kind?: 'code' | 'cmd' | 'ok' | 'err' | 'dim';
  lang?: Lang;
  /** Мельче (17 px) — для длинного вывода ошибки. */
  small?: boolean;
}

/** Тёмная мини-панель (код или терминал) с ярлыком-вкладкой сверху. */
export function DarkPanel({ label, lines, className }: { label: string; lines: PanelLine[]; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-center rounded-2xl bg-code-bg px-5 font-mono text-[19px] leading-[1.5] shadow-lift ring-1 ring-code-line/10',
        className,
      )}
      style={{ height: SLOT_H }}
    >
      <span className="absolute -top-3.5 right-4 rounded-lg border-2 border-border bg-surface px-2 font-mono text-[15px] leading-tight text-text-2">
        {label}
      </span>
      {lines.map((l, i) => (
        <PanelRow key={i} line={l} />
      ))}
    </div>
  );
}

function PanelRow({ line }: { line: PanelLine }) {
  const kind = line.kind ?? 'code';
  const size = line.small ? 'text-[17px]' : '';
  if (kind === 'code') {
    const tokens = highlight(line.text, line.lang ?? 'ts')[0] ?? [];
    return (
      <div className={cn('whitespace-pre', size)}>
        {tokens.map((t, j) => (
          <span key={j} className={TOKEN_CLASS[t.kind]}>
            {t.text}
          </span>
        ))}
      </div>
    );
  }
  if (kind === 'cmd') {
    return (
      <div className={cn('whitespace-pre font-semibold text-code-text', size)}>
        <span className="text-code-string">$ </span>
        {line.text}
      </div>
    );
  }
  if (kind === 'err') {
    return (
      <div className={cn('flex items-center gap-1.5 whitespace-pre text-code-prop', size)}>
        <X size={20} strokeWidth={3} className="shrink-0" />
        {line.text}
      </div>
    );
  }
  return (
    <div className={cn('whitespace-pre', kind === 'ok' ? 'text-code-string' : 'text-code-comment', size)}>{line.text}</div>
  );
}

/** Коммит в гите: иконка + файлы-чипы. */
export function CommitCard({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'absolute flex items-center justify-center gap-3 rounded-2xl border-2 bg-surface px-4 shadow-card transition-[border-color,box-shadow] duration-300',
        active ? 'border-git shadow-[0_0_0_6px_rgb(var(--c-git)/0.18)]' : 'border-git/40',
      )}
      style={{ left: COMMIT.x, top: COMMIT.y, width: COMMIT.w, height: COMMIT.h }}
    >
      <GitCommitHorizontal size={30} className="shrink-0 text-git" />
      {children}
    </div>
  );
}
