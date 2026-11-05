'use client';

import type { LucideIcon } from 'lucide-react';
import { ROLES, type RoleKey } from '../it-company/data';
import { Avatar } from '../it-company/parts';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

/** Человек из команды «Корзина»: имя и роль — берутся из `PEOPLE` первой лекции. */
export interface Person {
  name: string;
  role: RoleKey;
}

export interface PanelRow {
  icon: LucideIcon;
  label: string;
  text: string;
}

interface StagePanelProps {
  icon: LucideIcon;
  title: string;
  sub: string;
  tone: Tone;
  people?: readonly Person[];
  rows: readonly PanelRow[];
  height: number;
}

/** Подробности этапа: слева — название и кто рядом, справа — 2–3 строки «что/как/итог». */
export function StagePanel({ icon: Icon, title, sub, tone, people = [], rows, height }: StagePanelProps) {
  const t = TONE[tone];
  return (
    <div className={cn('card flex items-stretch gap-8 border-l-[8px] px-8 py-6', t.border)} style={{ height }}>
      <div className="flex w-[380px] shrink-0 flex-col justify-center gap-5">
        <div className="flex items-center gap-5">
          <span className={cn('flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
            <Icon size={40} />
          </span>
          <div>
            <div className="text-[32px] font-bold leading-tight">{title}</div>
            <div className={cn('mt-1 text-[22px] font-semibold', t.text)}>{sub}</div>
          </div>
        </div>
        {people.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {people.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <Avatar name={p.name} role={p.role} size={40} />
                <span className="text-[24px] font-semibold">{p.name}</span>
                <span className={cn('text-[19px] font-semibold', TONE[ROLES[p.role].tone].text)}>{ROLES[p.role].tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-5 border-l-2 border-border pl-8">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center gap-2 text-[17px] font-semibold uppercase tracking-wider text-muted">
              <r.icon size={18} strokeWidth={2.5} />
              {r.label}
            </div>
            <div className="mt-1 text-[26px] font-semibold leading-snug">{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Плашка нулевого шага: общий смысл, пока ни один этап не выбран. */
export function OverviewPanel({ icon: Icon, tone, title, text, height }: { icon: LucideIcon; tone: Tone; title: string; text: string; height: number }) {
  const t = TONE[tone];
  return (
    <div className={cn('card flex items-center gap-8 border-l-[8px] px-10', t.border)} style={{ height }}>
      <span className={cn('flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-3xl', t.soft, t.text)}>
        <Icon size={48} />
      </span>
      <div>
        <div className="text-[36px] font-bold leading-tight">{title}</div>
        <div className="mt-2 text-[26px] leading-snug text-text-2">{text}</div>
      </div>
    </div>
  );
}
