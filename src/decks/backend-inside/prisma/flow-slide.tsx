'use client';

import { ArrowRight, Code2, Database, FileCode2, FileText, Package } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { FileTree } from '@/components/ui/file-tree';
import { NodeBox, type NodeState } from '@/components/ui/node-box';
import { Packet } from '@/components/ui/packet';
import { Swap } from '@/components/ui/reveal';
import { SchemaCard } from '@/components/ui/schema-card';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import type { Tone } from '@/lib/tones';
import type { SlideProps } from '@/types';
import { FLOW_MODEL, FLOW_TYPE, FLOW_UP_SQL } from './data';
import { Editor } from './editor';

/**
 * Конвейер: SQL-миграция → PostgreSQL → schema.prisma → @prisma/client → твой код.
 * По шагу на звено; сквозной пример — колонка category из раздела «Миграции».
 * 0 — пишем миграцию руками
 * 1 — migrate:up: в таблице появилась колонка
 * 2 — prisma db pull: в schema.prisma появилось поле
 * 3 — prisma generate: в типе Item появилось свойство
 * 4 — автокомплит в коде + итог «база → схема → типы»
 */

const NODES: { tone: Tone; icon: typeof Database; title: string; sub: string }[] = [
  { tone: 'git', icon: FileText, title: 'Миграция', sub: '…-up.sql' },
  { tone: 'db', icon: Database, title: 'PostgreSQL', sub: '"Item"' },
  { tone: 'prisma', icon: FileCode2, title: 'schema.prisma', sub: 'model Item' },
  { tone: 'prisma', icon: Package, title: '@prisma/client', sub: 'node_modules' },
  { tone: 'logic', icon: Code2, title: 'Твой код', sub: 'handler.ts' },
];
const LINKS = ['migrate:up', 'prisma db pull', 'prisma generate', 'import'];

const NODE_W = 236;
const NODE_X = [0, 301, 602, 903, 1204];
const ROW_TOP = 66;
const ROW_MID = ROW_TOP + 36;

// Нижняя часть: слева «чем», справа «что получилось».
const DETAIL_TOP = 214;

const TERM: Record<number, TermLine[]> = {
  1: [
    { text: 'npm run migrate:up', kind: 'cmd' },
    { text: '> Migrating files:', kind: 'dim' },
    { text: '> - 20260115120000_add-item-category', kind: 'out' },
    { text: '### MIGRATION …_add-item-category (UP) ###', kind: 'out' },
    { text: 'Migrations complete!', kind: 'ok' },
  ],
  2: [
    { text: 'npx prisma db pull', kind: 'cmd' },
    { text: 'Prisma schema loaded from …/schema.prisma.', kind: 'dim' },
    { text: '✔ Introspected 3 models and wrote them into', kind: 'ok' },
    { text: '  …/prisma/schema.prisma in 112ms', kind: 'ok' },
    { text: 'Run prisma generate to generate Prisma Client.', kind: 'dim' },
  ],
  3: [
    { text: 'npx prisma generate', kind: 'cmd' },
    { text: 'Prisma schema loaded from …/schema.prisma.', kind: 'dim' },
    { text: '✔ Generated Prisma Client (v7.4.2) to', kind: 'ok' },
    { text: '  ./node_modules/@prisma/client in 87ms', kind: 'ok' },
  ],
};

function nodeState(i: number, step: number): NodeState {
  if (step === 4) return i === 4 ? 'active' : 'done';
  if (i === step) return 'active';
  if (i < step) return 'done';
  return 'dim';
}

export function FlowSlide({ step }: SlideProps) {
  const packetTone = NODES[step].tone;

  return (
    <SlideLayout section="prisma" title="Откуда Prisma знает про таблицы">
      {/* Конвейер */}
      {NODES.map((n, i) => (
        <NodeBox
          key={n.title}
          tone={n.tone}
          icon={n.icon}
          title={n.title}
          sub={n.sub}
          size="sm"
          state={nodeState(i, step)}
          className="absolute"
          style={{ left: NODE_X[i], top: ROW_TOP, width: NODE_W }}
        />
      ))}
      {LINKS.map((label, i) => {
        const on = step === i + 1;
        return (
          <Arrow
            key={label}
            show={step > i}
            from={[NODE_X[i] + NODE_W + 6, ROW_MID]}
            to={[NODE_X[i + 1] - 8, ROW_MID]}
            tone={on || step === 4 ? NODES[i + 1].tone : 'muted'}
            flow={on}
            label={label}
            labelOffset={[0, -66]}
          />
        );
      })}

      {/* «category» едет по конвейеру */}
      <Packet at={[NODE_X[step] + NODE_W / 2, ROW_TOP + 112]} tone={packetTone} className="text-[17px]">
        category
      </Packet>

      {/* Слева: чем получили это звено */}
      <div className="absolute" style={{ left: 0, top: DETAIL_TOP, width: 620 }}>
        <Swap k={step}>
          {step === 0 && (
            <FileTree
              size="sm"
              tone="git"
              items={[
                { name: 'migrations/', depth: 0, kind: 'dir' },
                { name: '20260115120000_add-item-category.ts', depth: 1, kind: 'ts', state: 'new' },
                { name: 'sqls/', depth: 1, kind: 'dir' },
                { name: '20260115120000_add-item-category-up.sql', depth: 2, kind: 'sql', state: 'new' },
                { name: '20260115120000_add-item-category-down.sql', depth: 2, kind: 'sql', state: 'new' },
              ]}
            />
          )}
          {step >= 1 && step <= 3 && <Terminal lines={TERM[step]} size="sm" style={{ height: 214 }} />}
          {step === 4 && <Summary />}
        </Swap>
      </div>

      {/* Справа: что получилось на этом звене */}
      <div className="absolute" style={{ left: 660, top: DETAIL_TOP, width: 780 }}>
        <Swap k={step}>
          {step === 0 && (
            <Code code={FLOW_UP_SQL} lang="sql" size="sm" tone="git" hl={[2]} title="…_add-item-category-up.sql" />
          )}
          {step === 1 && (
            <SchemaCard
              name="Item"
              tone="db"
              columns={[
                { name: 'id', type: 'UUID', pk: true },
                { name: 'title', type: 'VARCHAR(255)' },
                { name: 'price', type: 'NUMERIC(12,2)' },
                { name: 'stock', type: 'INT' },
                { name: 'category', type: 'VARCHAR(100)', state: 'new' },
              ]}
            />
          )}
          {step === 2 && <Code code={FLOW_MODEL} lang="prisma" size="sm" tone="prisma" hl={[5]} title="src/infrastructure/prisma/schema.prisma" />}
          {step === 3 && (
            <Code code={FLOW_TYPE} lang="ts" size="sm" tone="prisma" hl={[5]} title="node_modules/.prisma/client/index.d.ts" />
          )}
          {step === 4 && (
            <Editor
              file="item-queries.handler.ts"
              code={`const rows = await this.prisma.item.findMany();\nrows.map((item) => item.ca`}
              rows={6}
              cursor={{ line: 2, col: 26 }}
              popup={{
                line: 2,
                col: 24,
                match: 0,
                items: [
                  { label: 'category', kind: 'field', detail: 'string | null' },
                  { label: 'created_by', kind: 'field', detail: 'string | null' },
                  { label: 'date_create_at', kind: 'field', detail: 'Date' },
                ],
              }}
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={NODES[step].tone}
        captions={[
          'Всё начинается с SQL-миграции — её пишем руками',
          'migrate:up — колонка появилась в базе',
          'db pull — Prisma читает базу и переписывает schema.prisma',
          'generate — из схемы получаются TypeScript-типы',
          'Редактор знает про category — без единой ручной правки',
        ]}
      />
    </SlideLayout>
  );
}

/** Итог: направление и одна команда на два шага. */
function Summary() {
  return (
    <div className="card flex flex-col gap-7 px-7 py-6">
      <div>
        <div className="text-[18px] font-semibold uppercase tracking-wider text-muted">Направление</div>
        <div className="mt-2 flex items-center gap-4 text-[32px] font-bold">
          <span className="text-db">база</span>
          <ArrowRight size={32} className="text-muted" />
          <span className="text-prisma">схема</span>
          <ArrowRight size={32} className="text-muted" />
          <span className="text-logic">типы</span>
        </div>
      </div>
      <div>
        <div className="text-[18px] font-semibold uppercase tracking-wider text-muted">Оба шага одной командой</div>
        <div className="mt-3">
          <Chip tone="prisma" solid>
            npm run prisma:pull
          </Chip>
        </div>
        <div className="mt-3 font-mono text-[21px] text-text-2">
          = prisma db pull <span className="text-prisma">&amp;&amp;</span> prisma generate
        </div>
      </div>
    </div>
  );
}
