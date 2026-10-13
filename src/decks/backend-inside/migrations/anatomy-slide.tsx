'use client';

import { ArrowRight, CalendarClock, Terminal as TerminalIcon } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { FileTree, type FileItem } from '@/components/ui/file-tree';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { CATEGORY_DOWN, CATEGORY_UP, MIGRATIONS } from './data';

/**
 * Шаги:
 * 0 — имя: 20260115120000 = 2026-01-15 12:00:00, порядок = время в имени
 * 1 — up.sql: что сделать с базой (выполнит migrate:up)
 * 2 — down.sql: ровно обратное, в обратном порядке
 * 3 — обёртка .ts: просто читает SQL; копия initial-schema.ts с другим именем
 */

// Обёртка — как migrations/20260101000000_initial-schema.ts в etalon-backend,
// отличается только именем (длинная строка перенесена, чтобы влезть на слайд).
const WRAPPER = `import type { MigrationBuilder } from 'node-pg-migrate';
import { readFileSync } from 'fs';
import { join } from 'path';

const sql = (direction: 'up' | 'down') =>
  readFileSync(join(process.cwd(), 'migrations', 'sqls',
    \`20260115120000_add-item-category-\${direction}.sql\`), 'utf-8');

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(sql('up'));
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(sql('down'));
}`;

const [INITIAL, STOCK, CATEGORY] = MIGRATIONS;
const DATES = ['1 янв', '10 янв', '15 янв'];

type S = FileItem['state'];

function tree(step: number): FileItem[] {
  const mark = (on: boolean, rest: S = 'dim'): S => (on ? 'hl' : rest);
  const s0 = step === 0;
  const note = (i: number) =>
    s0 ? DATES[i] : step === 3 && i === 0 ? '← образец' : step === 3 && i === 2 ? '← копия' : undefined;
  return [
    { name: 'migrations/', depth: 0, kind: 'dir' },
    { name: `${INITIAL.name}.ts`, depth: 1, kind: 'ts', state: s0 || step === 3 ? 'normal' : 'dim', note: note(0) },
    { name: `${STOCK.name}.ts`, depth: 1, kind: 'ts', state: s0 ? 'normal' : 'dim', note: note(1) },
    { name: `${CATEGORY.name}.ts`, depth: 1, kind: 'ts', state: mark(s0 || step === 3), note: note(2) },
    { name: 'sqls/', depth: 1, kind: 'dir', state: s0 ? 'normal' : 'dim' },
    { name: `${INITIAL.name}-up.sql`, depth: 2, kind: 'sql', state: s0 ? 'normal' : 'dim' },
    { name: `${INITIAL.name}-down.sql`, depth: 2, kind: 'sql', state: s0 ? 'normal' : 'dim' },
    { name: `${STOCK.name}-up.sql`, depth: 2, kind: 'sql', state: s0 ? 'normal' : 'dim' },
    { name: `${STOCK.name}-down.sql`, depth: 2, kind: 'sql', state: s0 ? 'normal' : 'dim' },
    { name: `${CATEGORY.name}-up.sql`, depth: 2, kind: 'sql', state: mark(s0 || step === 1, step === 2 ? 'normal' : 'dim') },
    { name: `${CATEGORY.name}-down.sql`, depth: 2, kind: 'sql', state: mark(s0 || step === 2) },
  ];
}

// Правая колонка
const RX = 620;
const RW = 820;
const SQL_W = 680;
const DOWN_Y = 262;
// Центры строк кода в панели Code size="sm": шапка 45 + отступ 16 + строки по 29.45.
const lineY = (n: number) => 45 + 16 + (n - 1) * 29.45 + 14.7;

const SEGMENTS = [
  { t: '2026', l: 'год' },
  { t: '01', l: 'мес' },
  { t: '15', l: 'день' },
  { t: '12', l: 'час' },
  { t: '00', l: 'мин' },
  { t: '00', l: 'сек' },
];

function NameDecode() {
  return (
    <div style={{ width: RW }}>
      <div className="text-[20px] font-semibold uppercase tracking-[0.12em] text-muted">имя миграции</div>
      <div className="mt-3 flex items-start font-mono text-[38px] font-semibold leading-none">
        {SEGMENTS.map((s, i) => (
          <div key={i} className="mr-1.5 flex flex-col items-center">
            <span className="text-git">{s.t}</span>
            <span className="mt-2 h-1 w-full rounded-full bg-git/60" />
            <span className="mt-2 font-sans text-[16px] font-medium text-text-2">{s.l}</span>
          </div>
        ))}
        <div className="flex flex-col items-center">
          <span className="text-muted">_</span>
        </div>
        <div className="ml-1.5 flex flex-col items-center">
          <span className="text-ctrl">add-item-category</span>
          <span className="mt-2 h-1 w-full rounded-full bg-ctrl/60" />
          <span className="mt-2 font-sans text-[16px] font-medium text-text-2">что делает</span>
        </div>
      </div>

      <div className="mt-7 flex items-center gap-3 text-[28px] font-semibold">
        <CalendarClock size={30} className="text-git" />
        15 января 2026, 12:00:00
      </div>

      <div className="mt-10 text-[24px] font-semibold">Раннер применяет по возрастанию этого числа:</div>
      <div className="mt-4 flex items-center">
        {[INITIAL, STOCK, CATEGORY].map((m, i) => (
          <div key={m.name} className="flex items-center">
            {i > 0 && <ArrowRight size={30} className="mx-2 shrink-0 text-git" strokeWidth={2.5} />}
            <div
              className={cn(
                'card px-4 py-3',
                i === 2 ? 'border-git shadow-[0_0_0_6px_rgb(var(--c-git)/0.18)]' : '',
              )}
              style={{ width: 236 }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-bold">{i + 1}.</span>
                <span className="text-[22px] font-semibold text-git">{DATES[i]}</span>
              </div>
              <div className="mt-1 truncate font-mono text-[17px] text-text-2">{m.name.split('_')[1]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RunsWith({ cmd, tone }: { cmd: string; tone: 'git' | 'danger' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[22px] text-text-2">выполняет</span>
      <Chip tone={tone} icon={TerminalIcon}>
        {cmd}
      </Chip>
    </div>
  );
}

function Badge({ n, x, y, show }: { n: number; x: number; y: number; show: boolean }) {
  return (
    <Reveal show={show} from="scale" delay={0.2} className="absolute" style={{ left: x - 17, top: y - 17 }}>
      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-git text-[19px] font-bold text-white shadow-card">
        {n}
      </span>
    </Reveal>
  );
}

export function AnatomySlide({ step }: SlideProps) {
  const pair = step === 2;
  const bx = RX + SQL_W + 22;

  return (
    <SlideLayout section="migrations" title="Из чего состоит миграция">
      <FileTree items={tree(step)} size="sm" className="absolute" style={{ left: 0, top: 0, width: 560 }} />

      <div className="absolute" style={{ left: RX, top: 0, width: RW }}>
        <Swap k={step === 0 ? 'name' : step === 3 ? 'ts' : 'sql'}>
          {step === 0 && <NameDecode />}
          {(step === 1 || step === 2) && (
            <div className="relative" style={{ height: 540 }}>
              <Code
                code={CATEGORY_UP}
                lang="sql"
                size="sm"
                hl={[2, 4]}
                tone="git"
                title={`sqls/${CATEGORY.name}-up.sql`}
                style={{ width: SQL_W }}
              />
              <div className="absolute" style={{ left: 0, top: 212 }}>
                <RunsWith cmd="npm run migrate:up" tone="git" />
              </div>
              <Reveal show={pair} from="up" className="absolute" style={{ left: 0, top: DOWN_Y, width: SQL_W }}>
                <Code code={CATEGORY_DOWN} lang="sql" size="sm" hl={[2, 4]} tone="danger" title={`sqls/${CATEGORY.name}-down.sql`} />
                <div className="mt-4">
                  <RunsWith cmd="npm run migrate:down" tone="danger" />
                </div>
              </Reveal>
            </div>
          )}
          {step === 3 && (
            <Code code={WRAPPER} lang="ts" size="sm" hl={[7, 10, 14]} tone="git" title={`${CATEGORY.name}.ts`} />
          )}
        </Swap>
      </div>

      {/* Пары «сделал ↔ отменил»: первое в up отменяется последним в down */}
      <Badge n={1} x={bx} y={lineY(2)} show={pair} />
      <Badge n={2} x={bx} y={lineY(4)} show={pair} />
      <Badge n={2} x={bx} y={DOWN_Y + lineY(2)} show={pair} />
      <Badge n={1} x={bx} y={DOWN_Y + lineY(4)} show={pair} />
      <Arrow show={pair} from={[bx + 20, lineY(2)]} to={[bx + 20, DOWN_Y + lineY(4) - 6]} curve={-170} tone="git" delay={0.4} />
      <Arrow show={pair} from={[bx + 20, lineY(4)]} to={[bx + 20, DOWN_Y + lineY(2) - 6]} curve={-80} tone="git" delay={0.6} />

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'Имя = дата-время + что делает. Порядок применения = время в имени',
          'up.sql — что сделать с базой. Его выполнит migrate:up',
          'down.sql — ровно обратное, в обратном порядке',
          'Обёртка .ts только читает SQL: копируем initial-schema.ts, меняем имя',
        ]}
      />
    </SlideLayout>
  );
}
