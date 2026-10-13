'use client';

import { Check, Lock, Pencil } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { DataTable, type DataRow } from '@/components/ui/data-table';
import { Swap } from '@/components/ui/reveal';
import { SchemaCard, type SchemaColumn } from '@/components/ui/schema-card';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import type { SlideProps } from '@/types';
import { CATEGORY_UP, MIGRATIONS } from './data';

/**
 * Шаги:
 * 0 — add-item-category уже применена: строка в pgmigrations, колонка в базе
 * 1 — Вася правит применённый файл: VARCHAR(100) → VARCHAR(255)
 * 2 — migrate:up: «No migrations to run!» — база не изменилась
 * 3 — правильно: новая миграция widen-item-category → применилась
 */

const CATEGORY = MIGRATIONS[2];
const EDITED_UP = CATEGORY_UP.replace('VARCHAR(100)', 'VARCHAR(255)');

const WIDEN = { name: '20260125100000_widen-item-category', runOn: '10:04' };
const WIDEN_UP = `ALTER TABLE "Item"
    ALTER COLUMN category TYPE VARCHAR(255);`;

const TERMINAL: TermLine[][] = [
  [{ text: '# база Васи: применены все 4 миграции', kind: 'dim' }],
  [{ text: '# база Васи: применены все 4 миграции', kind: 'dim' }],
  [
    { text: 'npm run migrate:up', kind: 'cmd' },
    { text: 'No migrations to run!', kind: 'ok' },
    { text: 'Migrations complete!', kind: 'ok' },
  ],
  [
    { text: 'npm run migrate:up', kind: 'cmd' },
    { text: `> - ${WIDEN.name}`, kind: 'out' },
    { text: 'Migrations complete!', kind: 'ok' },
  ],
];

const LEFT_W = 680;
const RIGHT_X = 740;
const RIGHT_W = 700;

export function NoEditSlide({ step }: SlideProps) {
  const edited = step === 1 || step === 2;
  const fixed = step === 3;

  const applied: DataRow[] = MIGRATIONS.map((m, i) => ({
    key: m.name,
    cells: [i + 1, m.name, m.runOn],
    state: m === CATEGORY && step !== 1 && step !== 3 ? 'hl' : 'normal',
  }));
  if (fixed) applied.push({ key: WIDEN.name, cells: [5, WIDEN.name, WIDEN.runOn], state: 'new' });

  const columns: SchemaColumn[] = [
    { name: 'id', type: 'UUID', pk: true },
    { name: 'title', type: 'VARCHAR(255)' },
    { name: 'price', type: 'NUMERIC(12,2)' },
    { name: 'stock', type: 'INT' },
    {
      name: 'category',
      type: fixed ? 'VARCHAR(255)' : 'VARCHAR(100)',
      state: fixed ? 'new' : step === 0 || step === 2 ? 'hl' : 'normal',
    },
  ];

  const oldTitle = (
    <span className="flex items-center gap-3">
      sqls/{CATEGORY.name}-up.sql
      {edited ? (
        <Chip tone="warning" size="sm" icon={Pencil}>
          изменён
        </Chip>
      ) : fixed ? (
        <Chip tone="muted" size="sm" icon={Lock}>
          не трогаем
        </Chip>
      ) : (
        <Chip tone="success" size="sm" icon={Check}>
          применена
        </Chip>
      )}
    </span>
  );

  return (
    <SlideLayout section="migrations" title="Почему нельзя править применённую">
      {/* Слева: файлы и терминал */}
      <Code
        code={edited ? EDITED_UP : CATEGORY_UP}
        lang="sql"
        size="sm"
        hl={fixed ? [] : [2]}
        tone={edited ? 'warning' : 'git'}
        title={oldTitle}
        className="absolute"
        style={{ left: 0, top: 0, width: LEFT_W }}
      />

      <div className="absolute" style={{ left: 0, top: 212, width: LEFT_W }}>
        <Swap k={fixed ? 'new' : edited ? 'edit' : 'none'}>
          {fixed ? (
            <Code
              code={WIDEN_UP}
              lang="sql"
              size="sm"
              hl={[1, 2]}
              tone="success"
              title={
                <span className="flex items-center gap-3">
                  sqls/{WIDEN.name}-up.sql
                  <Chip tone="success" size="sm">
                    новая
                  </Chip>
                </span>
              }
            />
          ) : edited ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-warning bg-warning/10 px-5 py-3 text-[24px] font-semibold">
              <Pencil size={26} className="shrink-0 text-warning" />
              Правка в применённом файле: <M>100</M> → <M>255</M>
            </div>
          ) : null}
        </Swap>
      </div>

      <Terminal lines={TERMINAL[step]} className="absolute" style={{ left: 0, top: 366, width: LEFT_W, height: 162 }} />

      {/* Справа: что в базе Васи */}
      <DataTable
        title="pgmigrations"
        tone="db"
        columns={['id', 'name', 'run_on']}
        grid="28px 1fr 64px"
        rows={applied}
        size="sm"
        className="absolute"
        style={{ left: RIGHT_X, top: 0, width: RIGHT_W }}
      />
      <SchemaCard
        name="Item"
        columns={columns}
        size="sm"
        state={step === 2 ? 'error' : fixed ? 'hl' : 'normal'}
        badge={
          step === 2 ? (
            <Chip tone="danger" size="sm">
              в файле 255, в базе 100
            </Chip>
          ) : (
            <Chip tone="db" size="sm">
              база Васи
            </Chip>
          )
        }
        className="absolute"
        style={{ left: RIGHT_X, top: 330, width: RIGHT_W }}
      />

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'add-item-category уже применена — она записана в pgmigrations',
          'Вася правит уже применённый файл: VARCHAR(100) → VARCHAR(255)',
          '«No migrations to run!» — база не изменилась, правка никуда не попала',
          'Правильно: новая миграция — она применится у всех',
        ]}
      />
    </SlideLayout>
  );
}
