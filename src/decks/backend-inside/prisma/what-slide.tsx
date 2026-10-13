'use client';

import { Database, Triangle } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { DataTable, type DataRow } from '@/components/ui/data-table';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { ITEM_ROWS, WHAT_ROWS, WHAT_SQL, WHAT_TS } from './data';
import { Zone } from './parts';

/**
 * Шаги:
 * 0 — хендлер вызывает prisma.item.findMany — SQL в коде нет
 * 1 — Prisma переводит вызов в SQL
 * 2 — PostgreSQL выполняет SQL и отдаёт строки
 * 3 — Prisma превращает строки в JS-объекты типа Item[]
 */

// Раскладка: слева «твой код», в центре Prisma, справа PostgreSQL.
const PG = { left: 880, top: 0, width: 560, height: 540 };

export function WhatSlide({ step }: SlideProps) {
  const there = step === 1;
  const back = step === 3;

  const rows: DataRow[] =
    step >= 2
      ? ITEM_ROWS.map((r) => ({
          key: r.id,
          cells: [r.id, r.title, r.price],
          state: step === 3 ? 'hl' : 'normal',
        }))
      : [];

  return (
    <SlideLayout section="prisma" title="Prisma — переводчик с TS на SQL">
      {/* Слева: твой код */}
      <Code
        code={WHAT_TS}
        lang="ts"
        size="sm"
        title="ListItemsHandler"
        tone="logic"
        hl={step === 0 ? [1, 2, 3, 4, 5, 6] : undefined}
        className="absolute"
        style={{ left: 0, top: 0, width: 560 }}
      />
      <Reveal show={step >= 3} from="left" delay={0.5} className="absolute" style={{ left: 0, top: 316, width: 560 }}>
        <Code code={WHAT_ROWS} lang="ts" size="sm" title="rows: Item[]" tone="logic" hl={back ? [2, 3, 4] : undefined} />
      </Reveal>

      {/* Центр: Prisma */}
      <NodeBox
        tone="prisma"
        icon={Triangle}
        title="Prisma"
        sub="TS → SQL"
        state={there || back ? 'active' : step === 2 ? 'dim' : 'idle'}
        className="absolute"
        style={{ left: 606, top: 222, width: 228 }}
      />

      {/* Справа: PostgreSQL — сюда приходит SQL, отсюда уходят строки */}
      <Zone
        tone="db"
        icon={Database}
        label="PostgreSQL"
        state={step === 2 ? 'active' : step === 0 ? 'dim' : 'idle'}
        className="absolute bg-surface/40"
        style={PG}
      />
      <Reveal show={step >= 1} from="right" delay={0.45} className="absolute" style={{ left: PG.left + 16, top: 56, width: PG.width - 32 }}>
        <Code code={WHAT_SQL} lang="sql" size="sm" tone="prisma" hl={step === 2 ? [1, 2, 3, 4, 5, 6] : undefined} />
      </Reveal>
      <Reveal show={step >= 2} delay={0.2} className="absolute" style={{ left: PG.left + 16, top: 300, width: PG.width - 32 }}>
        <DataTable title={'"Item"'} tone="db" columns={['id', 'title', 'price']} grid="110px 1fr 120px" rows={rows} size="sm" />
      </Reveal>

      {/* Туда: вызов → Prisma → SQL */}
      <Arrow show={step >= 1} from={[566, 120]} to={[676, 214]} curve={-26} tone={there ? 'prisma' : 'muted'} flow={there} />
      <Arrow
        show={step >= 1}
        from={[766, 214]}
        to={[888, 150]}
        curve={-26}
        tone={there ? 'prisma' : 'muted'}
        flow={there}
        delay={0.25}
        label="SQL"
        labelOffset={[-6, -22]}
      />

      {/* Обратно: строки → Prisma → объекты */}
      <Arrow show={step >= 3} from={[888, 440]} to={[772, 332]} curve={-24} tone={back ? 'db' : 'muted'} flow={back} />
      <Arrow show={step >= 3} from={[668, 332]} to={[566, 440]} curve={-24} tone={back ? 'prisma' : 'muted'} flow={back} delay={0.25} />

      <StepCaption
        step={step}
        tone="prisma"
        captions={[
          'Хендлер вызывает метод — ни строчки SQL',
          'Prisma переводит вызов в SQL',
          'PostgreSQL выполняет SQL и отдаёт строки',
          'Prisma собирает из строк объекты — тип Item[]',
        ]}
      />
    </SlideLayout>
  );
}
