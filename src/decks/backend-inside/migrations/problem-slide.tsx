'use client';

import { Brain, Check, FileCode2, X } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Reveal, Swap } from '@/components/ui/reveal';
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
 * 0 — три машины, у всех одинаковый "Item"
 * 1 — Вася руками в pgAdmin: ALTER TABLE → колонка только у него
 * 2 — Вася пушит код с item.category → у Пети ошибка, на проде 500
 * 3 — вывод: код уехал через гит, ALTER остался у Васи в голове
 */

const CODE_LINE: PanelLine = { text: 'category: item.category,', lang: 'ts' };

const PANELS: PanelLine[][] = [
  [CODE_LINE, { text: '200 OK', kind: 'ok' }],
  [CODE_LINE, { text: 'column "category" does not exist', kind: 'err', small: true }],
  [CODE_LINE, { text: '500 Internal Server Error', kind: 'err' }],
];

const PGADMIN: PanelLine[] = [
  { text: 'ALTER TABLE "Item"', lang: 'sql' },
  { text: 'ADD COLUMN category VARCHAR(100);', lang: 'sql' },
];

export function ProblemSlide({ step }: SlideProps) {
  const pushed = step >= 2;
  const moral = step === 3;

  const vasyaCols: SchemaColumn[] =
    step >= 1
      ? [...ITEM_BASE, { ...CATEGORY_COL, state: step === 1 ? 'new' : moral ? 'hl' : 'normal' }]
      : ITEM_BASE;
  // У Пети и на проде колонки нет; на выводе показываем «дыру».
  const otherCols: SchemaColumn[] = moral
    ? [...ITEM_BASE, { name: 'category', type: '—', state: 'removed' }]
    : ITEM_BASE;

  const arrowTone = pushed ? 'git' : 'muted';

  return (
    <SlideLayout section="migrations" title="Как НЕ надо: менять базу руками">
      {/* Общий репозиторий; на шаге 2 в нём коммит Васи — только код */}
      <CommitCard active={step === 2}>
        <Swap k={pushed ? 'commit' : 'repo'}>
          {pushed ? (
            <div className="flex items-center gap-3">
              <Chip tone="ctrl" icon={FileCode2}>
                item.presenter.ts
              </Chip>
              <Reveal show={moral} from="scale">
                <Chip tone="danger" icon={X} className="border-dashed">
                  ALTER TABLE — нет
                </Chip>
              </Reveal>
            </div>
          ) : (
            <span className="text-[24px] font-semibold text-text-2">общий гит-репозиторий</span>
          )}
        </Swap>
      </CommitCard>

      {/* Изменение базы — только в голове у Васи */}
      <Reveal show={moral} from="scale" className="absolute" style={{ left: 0, top: 0, width: 292 }}>
        <div className="rounded-3xl border-2 border-dashed border-warning bg-warning/10 px-4 py-3">
          <div className="flex items-center gap-2 text-[22px] font-semibold text-warning">
            <Brain size={26} />
            только в голове
          </div>
          <div className="mt-1 font-mono text-[19px] leading-[1.45] text-text-2">
            {'ALTER TABLE "Item"'}
            <br />
            ADD COLUMN category…
          </div>
        </div>
      </Reveal>

      {/* Стрелки гита */}
      {(['push', 'pull', 'deploy'] as const).map((k, i) => {
        const a = GIT_ARROWS[k];
        return (
          <Arrow
            key={k}
            show={pushed}
            from={a.from}
            to={a.to}
            curve={k === 'push' ? 14 : k === 'deploy' ? -20 : 0}
            tone={arrowTone}
            flow={step === 2}
            label={a.label}
            labelOffset={a.offset}
            delay={i === 0 ? 0 : 0.5}
          />
        );
      })}

      {/* Три машины */}
      <MachineHead index={0}>
        {pushed && (
          <Chip tone="success" size="sm" icon={Check}>
            работает
          </Chip>
        )}
      </MachineHead>
      <MachineHead index={1}>
        {pushed && (
          <Chip tone="danger" size="sm" icon={X}>
            ошибка
          </Chip>
        )}
      </MachineHead>
      <MachineHead index={2}>
        {pushed && (
          <Chip tone="danger" size="sm" solid>
            500
          </Chip>
        )}
      </MachineHead>

      {/* Панели: у Васи сначала pgAdmin, потом код; у остальных код приезжает на шаге 2 */}
      <div className="absolute" style={{ left: MACHINES[0].x, top: ROW.slot, width: COL_W }}>
        <Swap k={step === 0 ? 'none' : step === 1 ? 'pg' : 'code'}>
          {step === 1 ? (
            <DarkPanel label="pgAdmin · Query Tool" lines={PGADMIN} />
          ) : step >= 2 ? (
            <DarkPanel label="item.presenter.ts" lines={PANELS[0]} />
          ) : (
            <div style={{ height: 92 }} />
          )}
        </Swap>
      </div>
      {[1, 2].map((i) => (
        <Reveal
          key={i}
          show={pushed}
          from="down"
          delay={0.7}
          className="absolute"
          style={{ left: MACHINES[i].x, top: ROW.slot, width: COL_W }}
        >
          <DarkPanel label="item.presenter.ts" lines={PANELS[i]} />
        </Reveal>
      ))}

      {/* База на каждой машине */}
      <SchemaCard
        name="Item"
        columns={vasyaCols}
        size="sm"
        state={step === 1 || moral ? 'hl' : 'normal'}
        badge={<Chip size="sm" tone="db">база Васи</Chip>}
        className="absolute"
        style={{ left: MACHINES[0].x, top: ROW.schema, width: COL_W }}
      />
      {[1, 2].map((i) => (
        <SchemaCard
          key={i}
          name="Item"
          columns={otherCols}
          size="sm"
          state={pushed ? 'error' : 'normal'}
          badge={<Chip size="sm" tone="db">{i === 1 ? 'база Пети' : 'прод-база'}</Chip>}
          className="absolute"
          style={{ left: MACHINES[i].x, top: ROW.schema, width: COL_W }}
        />
      ))}

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'У каждого своя база. Пока схема у всех одинаковая',
          'Вася добавил колонку руками в pgAdmin — только у себя',
          'Код с item.category уехал по гиту: у Пети ошибка, на проде 500',
          'Код ездит через гит, а изменение базы осталось у Васи в голове',
        ]}
      />
    </SlideLayout>
  );
}
