'use client';

import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Console } from '../parts';

/**
 * Правила из migrations/README.md игры — у каждого своя миграция-урок.
 * 0 — история: не править применённую, рабочий down, не «в прошлом»
 * 1 — данные: NOT NULL через бэкфилл, DROP = потеря данных, CHECK — DROP + ADD
 * 2 — после миграции — prisma:pull и смотреть дифф
 * 3 — цикл работы целиком
 */

const RULES: { text: string; from?: string; group: number }[] = [
  { text: 'Применённую не править — писать новую', from: 'run-active-index-fix', group: 0 },
  { text: 'У каждой рабочий down: up → down → up', group: 0 },
  { text: 'Не создавать миграцию «в прошлом»', group: 0 },
  { text: 'NOT NULL в непустую — бэкфилл или DEFAULT', from: 'user-nickname', group: 1 },
  { text: 'DROP колонки — потеря данных: сначала бэкап', from: 'items-become-loot', group: 1 },
  { text: 'CHECK не «дописывают»: DROP + ADD', from: 'locations-v2', group: 1 },
  { text: 'После миграции — prisma:pull и смотреть дифф', from: 'run-active-index-fix', group: 2 },
];

const ROW_H = 64;
const GAP = 10;
const LIST_W = 940;

export function RulesSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="migrations" title="Правила миграций игры">
      {RULES.map((r, i) => {
        const current = r.group === step;
        return (
          <Reveal
            key={r.text}
            show={step >= r.group}
            from="left"
            delay={current ? (i % 3) * 0.08 : 0}
            className="absolute"
            style={{ left: 0, top: i * (ROW_H + GAP), width: LIST_W }}
          >
            <div
              className={cn(
                'relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 bg-surface px-5 shadow-card transition-[border-color,box-shadow] duration-300',
                current ? 'border-git/40 shadow-[0_0_0_6px_rgb(var(--c-git)/0.15)]' : 'border-border',
              )}
              style={{ height: ROW_H }}
            >
              <span className="absolute inset-y-0 left-0 w-2 bg-git" />
              <span className="w-8 shrink-0 font-mono text-[20px] font-bold text-git">{i + 1}</span>
              <span className={cn('text-[24px]', current ? 'font-semibold' : 'text-text-2')}>{r.text}</span>
              {r.from && (
                <Chip tone="git" size="sm" className="ml-auto">
                  {r.from}
                </Chip>
              )}
            </div>
          </Reveal>
        );
      })}

      <Reveal show={step === 3} from="left" className="absolute" style={{ left: LIST_W + 40, top: 0, width: 1440 - LIST_W - 40 }}>
        <Console
          title="цикл работы — migrations/README.md"
          lines={[
            { text: '1. npm run migrate:create -- <имя>', kind: 'out' },
            { text: '2. пишем up.sql и down.sql', kind: 'dim' },
            { text: '3. npm run migrate:up', kind: 'out' },
            { text: '4. npm run migrate:down', kind: 'out' },
            { text: '5. npm run migrate:up', kind: 'out' },
            { text: '6. npm run prisma:pull', kind: 'ok' },
            { text: '7. пишем код', kind: 'dim' },
          ]}
        />
      </Reveal>

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'История в гите не переписывается: только новые миграции',
          'Данные дороже структуры: бэкфилл, бэкап, DROP + ADD',
          'Миграция закончена, когда prisma:pull показал то, что ты ждал',
          'Цикл целиком: создать → up → down → up → prisma:pull → код',
        ]}
      />
    </SlideLayout>
  );
}
