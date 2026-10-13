'use client';

import { Check, Cog, FolderOpen } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { DataTable, type DataRow } from '@/components/ui/data-table';
import { NodeBox } from '@/components/ui/node-box';
import { SchemaCard, type SchemaColumn } from '@/components/ui/schema-card';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import type { SlideProps } from '@/types';
import { MIGRATIONS } from './data';

/**
 * Шаги:
 * 0 — в базе применены 2 из 3 миграций
 * 1 — migrate:up: раннер сверяет папку с pgmigrations
 * 2 — выполняет up.sql новой миграции → в Item появилась колонка
 * 3 — пишет строку в pgmigrations
 * 4 — повторный migrate:up: «No migrations to run!»
 * 5 — migrate:down: последняя запись → down.sql → колонка удалена
 * 6 — строка из pgmigrations удалена
 */

const TERMINAL: TermLine[][] = [
  [{ text: '# база Васи: применены 2 миграции из 3', kind: 'dim' }],
  [
    { text: 'npm run migrate:up', kind: 'cmd' },
    { text: '> Migrating files:', kind: 'dim' },
    { text: '> - 20260115120000_add-item-category', kind: 'out' },
  ],
  [
    { text: '### MIGRATION …_add-item-category (UP) ###', kind: 'out' },
    { text: 'ALTER TABLE "Item" ADD COLUMN category …;', kind: 'dim' },
  ],
  [
    { text: "INSERT INTO pgmigrations (name, …) VALUES (…);", kind: 'dim' },
    { text: 'Migrations complete!', kind: 'ok' },
  ],
  [
    { text: 'npm run migrate:up', kind: 'cmd' },
    { text: 'No migrations to run!', kind: 'ok' },
  ],
  [
    { text: 'npm run migrate:down', kind: 'cmd' },
    { text: '### MIGRATION …_add-item-category (DOWN) ###', kind: 'out' },
    { text: 'ALTER TABLE "Item" DROP COLUMN category;', kind: 'dim' },
  ],
  [
    { text: "DELETE FROM pgmigrations WHERE name = '…';", kind: 'dim' },
    { text: 'Migrations complete!', kind: 'ok' },
  ],
];

const BASE_COLUMNS: SchemaColumn[] = [
  { name: 'id', type: 'UUID', pk: true },
  { name: 'title', type: 'VARCHAR(255)' },
  { name: 'price', type: 'NUMERIC(12,2)' },
  { name: 'stock', type: 'INT' },
];

function fileStatus(i: number, step: number) {
  if (step === 0) return null;
  if (i < 2) return <Check size={24} className="text-success" strokeWidth={3} />;
  // Третья миграция — по шагам.
  if (step === 1) return <Chip tone="git" size="sm">новая</Chip>;
  if (step === 2) return <Chip tone="git" size="sm" solid>up…</Chip>;
  if (step === 5) return <Chip tone="danger" size="sm" solid>down…</Chip>;
  if (step === 6) return <Chip tone="git" size="sm">новая</Chip>;
  return <Check size={24} className="text-success" strokeWidth={3} />;
}

export function RunnerSlide({ step }: SlideProps) {
  const files: DataRow[] = MIGRATIONS.slice(0, 3).map((m, i) => ({
    key: m.name,
    cells: [m.name, fileStatus(i, step)],
    state: i === 2 && [1, 2, 5, 6].includes(step) ? 'hl' : 'normal',
  }));

  const applied: DataRow[] = MIGRATIONS.slice(0, 2).map((m, i) => ({
    key: m.name,
    cells: [i + 1, m.name, m.runOn],
    state: step === 1 || step === 4 ? 'hl' : 'normal',
  }));
  if (step >= 3 && step <= 5) {
    applied.push({
      key: MIGRATIONS[2].name,
      cells: [3, MIGRATIONS[2].name, MIGRATIONS[2].runOn],
      state: step === 3 ? 'new' : step === 5 ? 'removed' : step === 4 ? 'hl' : 'normal',
    });
  }

  const columns: SchemaColumn[] = [...BASE_COLUMNS];
  if (step >= 2 && step <= 5) {
    columns.push({
      name: 'category',
      type: 'VARCHAR(100)',
      state: step === 2 || step === 3 ? 'new' : step === 5 ? 'removed' : 'normal',
    });
  }

  const terminal = TERMINAL.slice(0, step + 1).flat();
  const runnerBusy = [1, 2, 4, 5].includes(step);
  const touchesDb = step === 2 || step === 5;

  return (
    <SlideLayout section="migrations" title={<>Что делает <M>migrate:up</M> и <M>migrate:down</M></>}>
      {/* Слева: папка с миграциями и терминал */}
      <DataTable
        title="migrations/"
        icon={FolderOpen}
        tone="git"
        columns={['файл', '']}
        grid="1fr 110px"
        rows={files}
        size="sm"
        className="absolute"
        style={{ left: 0, top: 0, width: 560 }}
      />
      <Terminal lines={terminal} size="sm" className="absolute" style={{ left: 0, top: 262, width: 560, height: 290 }} />

      {/* Центр: раннер */}
      <NodeBox
        tone="git"
        icon={Cog}
        title="Раннер"
        sub="node-pg-migrate"
        state={runnerBusy ? 'active' : 'idle'}
        className="absolute"
        style={{ left: 575, top: 172, width: 290 }}
      />
      <Arrow show={step >= 1} from={[562, 110]} to={[640, 166]} curve={-20} tone={runnerBusy ? 'git' : 'muted'} label="читает" />
      <Arrow show={step >= 1} from={[800, 166]} to={[878, 110]} curve={-20} tone={runnerBusy ? 'db' : 'muted'} label="сверяет" />
      <Arrow show={step >= 2} from={[800, 274]} to={[878, 330]} curve={20} tone={touchesDb ? 'db' : 'muted'} flow={touchesDb} label={step >= 5 ? 'down.sql' : 'up.sql'} />

      {/* Справа: база — служебная таблица и сама таблица Item */}
      <DataTable
        title="pgmigrations"
        tone="db"
        columns={['id', 'name', 'run_on']}
        grid="28px 1fr 64px"
        rows={applied}
        size="sm"
        className="absolute"
        style={{ left: 880, top: 0, width: 560 }}
      />
      <SchemaCard
        name="Item"
        columns={columns}
        size="sm"
        state={touchesDb ? 'hl' : 'normal'}
        className="absolute"
        style={{ left: 880, top: 262, width: 560 }}
      />

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'В базе Васи применены 2 миграции из 3',
          'Раннер сверяет папку с таблицей pgmigrations',
          'Новую миграцию выполняет: запускает её up.sql',
          '…и записывает в pgmigrations: «эта уже применена»',
          'Повторный запуск ничего не делает — всё уже применено',
          'migrate:down берёт последнюю запись и выполняет down.sql',
          'Запись удалена — следующий migrate:up применит миграцию снова',
        ]}
      />
    </SlideLayout>
  );
}
