'use client';

import { Check, FileCode2, FileStack } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SchemaCard, type SchemaColumn } from '@/components/ui/schema-card';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import {
  CATEGORY_COL,
  COL_W,
  CommitCard,
  DarkPanel,
  GIT_ARROWS,
  ITEM_BASE,
  MACHINES,
  MachineHead,
  ROW,
  type PanelLine,
} from './machines';

/**
 * Шаги:
 * 0 — Вася пушит один коммит: код + файл миграции add-item-category
 * 1 — коммит приезжает к Пете и на прод; везде запускают migrate:up
 * 2 — миграция выполнилась у всех: в "Item" есть category, схема одинаковая
 */

const BASE_SCHEMA: SchemaColumn[] = ITEM_BASE;

export function IdeaSlide({ step }: SlideProps) {
  const arrived = step >= 1;
  const done = step >= 2;

  const columns: SchemaColumn[] = done ? [...BASE_SCHEMA, { ...CATEGORY_COL, state: 'new' }] : BASE_SCHEMA;
  const terminal: PanelLine[] = [
    { text: 'npm run migrate:up', kind: 'cmd' },
    done ? { text: 'Migrations complete!', kind: 'ok' } : { text: '…', kind: 'dim' },
  ];

  return (
    <SlideLayout section="migrations" title="Миграция — изменение базы файлом в гите">
      {/* Коммит: код + миграция */}
      <CommitCard active={step === 0}>
        <Chip tone="ctrl" icon={FileCode2}>
          item.presenter.ts
        </Chip>
        <span className="text-[26px] font-bold text-muted">+</span>
        <Chip tone="git" icon={FileStack} solid>
          …_add-item-category
        </Chip>
      </CommitCard>

      {(['push', 'pull', 'deploy'] as const).map((k) => {
        const a = GIT_ARROWS[k];
        const show = k === 'push' || arrived;
        const live = k === 'push' ? step === 0 : step === 1;
        return (
          <Arrow
            key={k}
            show={show}
            from={a.from}
            to={a.to}
            curve={k === 'push' ? 14 : k === 'deploy' ? -20 : 0}
            tone="git"
            flow={live}
            label={a.label}
            labelOffset={a.offset}
          />
        );
      })}

      {/* Три машины: у каждой — терминал и своя база */}
      {MACHINES.map((m, i) => (
        <MachineHead key={m.key} index={i as 0 | 1 | 2}>
          <Reveal show={done} from="scale" delay={0.3 + i * 0.15}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-white shadow-card">
              <Check size={22} strokeWidth={3} />
            </span>
          </Reveal>
        </MachineHead>
      ))}

      {MACHINES.map((m, i) => (
        <Reveal
          key={m.key}
          show={arrived}
          from="down"
          delay={i === 0 ? 0 : 0.5}
          className="absolute"
          style={{ left: m.x, top: ROW.slot, width: COL_W }}
        >
          <DarkPanel label="terminal" lines={terminal} />
        </Reveal>
      ))}

      {MACHINES.map((m, i) => (
        <SchemaCard
          key={m.key}
          name="Item"
          columns={columns}
          size="sm"
          state={done ? 'hl' : 'normal'}
          badge={<Chip size="sm" tone="db">{['база Васи', 'база Пети', 'прод-база'][i]}</Chip>}
          className="absolute"
          style={{ left: m.x, top: ROW.schema, width: COL_W }}
        />
      ))}

      {/* «=» между базами */}
      {[COL_W + 35, MACHINES[2].x - 35].map((x) => (
        <Reveal key={x} show={done} from="scale" delay={0.4} className="absolute" style={{ left: x - 24, top: ROW.schema + 80, width: 48 }}>
          <div className="text-center text-[56px] font-bold leading-none text-success">=</div>
        </Reveal>
      ))}

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'Изменение базы записано в файл и едет в одном коммите с кодом',
          'Файл миграции приехал ко всем — каждый запускает migrate:up',
          'В "Item" у всех появилась category — схема одинаковая',
        ]}
      />
    </SlideLayout>
  );
}
