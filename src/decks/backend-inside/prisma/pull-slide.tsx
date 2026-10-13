'use client';

import { ArrowRight, TriangleAlert } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { PULL_MODEL, PULL_SQL } from './data';
import { Plate } from './parts';

/**
 * Слева CREATE TABLE "Item" (initial-schema-up.sql), справа model Item (schema.prisma).
 * По шагам подсвечиваются пары строк:
 * 0 — таблица ↔ model
 * 1 — id UUID DEFAULT gen_random_uuid() ↔ @id @default(dbgenerated(…)) @db.Uuid
 * 2 — NOT NULL ↔ String, без NOT NULL ↔ String?
 * 3 — NUMERIC(12, 2) ↔ Decimal
 * 4 — FOREIGN KEY ↔ поле-связь User
 * 5 — файл перезаписывается при каждом pull
 */

const SQL_W = 470;
const MODEL_X = 514;

// Центр строки n (с 1) в панели Code size="sm" с заголовком.
const lineY = (n: number) => 73 + (n - 1) * 29.45;

const PAIRS: { sql: number[]; model: number[]; links: [number, number][] }[] = [
  { sql: [1, 13], model: [1, 9], links: [[1, 1]] },
  { sql: [2, 3], model: [2], links: [[2.5, 2]] },
  { sql: [4, 5], model: [3, 4], links: [[4, 3], [5, 4]] },
  { sql: [6, 7], model: [5], links: [[6.5, 5]] },
  { sql: [8, 10, 11, 12], model: [6, 8], links: [[8, 6], [11, 8]] },
];

export function PullSlide({ step }: SlideProps) {
  const pair = PAIRS[step];

  return (
    <SlideLayout section="prisma" title={<><M>db pull</M>: таблица → модель</>}>
      <Code
        code={PULL_SQL}
        lang="sql"
        size="sm"
        tone="db"
        title="initial-schema-up.sql"
        hl={pair?.sql}
        className="absolute"
        style={{ left: 0, top: 0, width: SQL_W }}
      />
      <Code
        code={PULL_MODEL}
        lang="prisma"
        size="sm"
        tone="prisma"
        title="schema.prisma"
        hl={pair?.model}
        className={step === 5 ? 'absolute ring-4 ring-warning/70' : 'absolute'}
        style={{ left: MODEL_X, top: 0, width: 1440 - MODEL_X }}
      />

      {/* Связки между парами строк */}
      {PAIRS.map((p, i) =>
        p.links.map(([a, b]) => (
          <Arrow
            key={`${i}-${a}`}
            show={step === i}
            from={[SQL_W + 2, lineY(a)]}
            to={[MODEL_X - 4, lineY(b)]}
            tone="prisma"
            width={3}
          />
        )),
      )}

      {/* Пояснение к текущей паре */}
      <div className="absolute" style={{ left: MODEL_X, top: 372, width: 1440 - MODEL_X }}>
        <Swap k={step}>
          {step === 0 && (
            <Pair sql={'CREATE TABLE "Item"'} model="model Item">
              таблица → модель, имя то же
            </Pair>
          )}
          {step === 1 && (
            <Pair sql="UUID … gen_random_uuid()" model="String @db.Uuid">
              в TS — строка, значение выдаёт база
            </Pair>
          )}
          {step === 2 && (
            <div className="card flex flex-col gap-3 px-6 py-4">
              <PairRow sql="NOT NULL" model="String">
                обязательное
              </PairRow>
              <PairRow sql="без NOT NULL" model="String?">
                <b className="text-prisma">?</b> = может быть null
              </PairRow>
            </div>
          )}
          {step === 3 && (
            <Pair sql="NUMERIC(12, 2)" model="Decimal">
              точные деньги, не float
            </Pair>
          )}
          {step === 4 && (
            <Pair sql="FOREIGN KEY" model="User User?">
              поле-связь: автор товара
            </Pair>
          )}
          {step === 5 && (
            <Plate tone="warning" icon={TriangleAlert}>
              Руками не правим: каждый <M>db pull</M> перезапишет файл
              <div className="mt-1.5 font-mono text-[17px] font-normal text-text-2">
                {'// ВНИМАНИЕ: файл генерируется из живой БД'}
              </div>
            </Plate>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="prisma"
        captions={[
          'db pull читает таблицу и пишет модель',
          'Первичный ключ: UUID → String, DEFAULT остаётся за базой',
          'Нет NOT NULL — в модели знак вопроса',
          'NUMERIC → Decimal: копейки не теряются',
          'Внешний ключ превращается в поле-связь',
          'schema.prisma — копия базы, а не исходник',
        ]}
      />
    </SlideLayout>
  );
}

function PairRow({ sql, model, children }: { sql: string; model: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Chip tone="db">{sql}</Chip>
      <ArrowRight size={26} className="shrink-0 text-muted" />
      <Chip tone="prisma">{model}</Chip>
      <span className="ml-3 text-[24px] text-text-2">{children}</span>
    </div>
  );
}

function Pair(props: { sql: string; model: string; children: React.ReactNode }) {
  return (
    <div className="card px-6 py-5">
      <PairRow {...props} />
    </div>
  );
}
