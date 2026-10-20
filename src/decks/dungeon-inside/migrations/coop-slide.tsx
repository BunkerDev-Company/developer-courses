'use client';

import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SchemaCard, type SchemaColumn } from '@/components/ui/schema-card';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';

/**
 * Миграция 20261015100100_coop-run-players: забег проходит отряд.
 * 0 — было: у забега один игрок, его позиция прямо в Run
 * 1 — CREATE TABLE "RunPlayer": участники отряда
 * 2 — INSERT … SELECT: каждый старый забег = отряд из одного хоста
 * 3 — DROP COLUMN pos_x/pos_y из Run; UNIQUE меняется вместе со смыслом
 */

// Выдержки из …_coop-run-players-up.sql (строки SELECT собраны плотнее).
const CODE: string[] = [
  `-- Было: Run.user_id — единственный игрок забега, его позиция в Run.pos_x/y.
-- Стало: Run.user_id — владелец (хост, тот, кто создал комнату), а участники —
-- отдельная таблица "RunPlayer" (связь многие-ко-многим User <-> Run …).`,
  `CREATE TABLE "RunPlayer"
(
    run_id         UUID        NOT NULL,
    user_id        UUID        NOT NULL,
    slot           SMALLINT    NOT NULL,
    …`,
  `INSERT INTO "RunPlayer" (run_id, user_id, slot, is_host, status, pos_x, pos_y,
                         waves_cleared, gold_earned, date_join_at, date_leave_at)
SELECT id, user_id, 0, TRUE,
       CASE WHEN status = 'active' THEN 'active' ELSE 'finished' END,
       pos_x, pos_y, …
FROM "Run";`,
  `ALTER TABLE "Run"
    DROP COLUMN pos_x,
    DROP COLUMN pos_y;
…
ALTER TABLE "RunOffer" DROP CONSTRAINT uq_run_offer_wave;
ALTER TABLE "RunOffer" ADD CONSTRAINT uq_run_offer_player_wave UNIQUE (run_id, user_id, wave);`,
];

function runCols(step: number): SchemaColumn[] {
  const pos = step === 0 ? 'hl' : step === 3 ? 'removed' : 'normal';
  return [
    { name: 'id', type: 'UUID', pk: true },
    { name: 'user_id', type: 'UUID' },
    { name: 'status', type: 'VARCHAR(12)' },
    { name: 'pos_x', type: 'REAL', state: pos },
    { name: 'pos_y', type: 'REAL', state: pos },
  ];
}

function playerCols(step: number): SchemaColumn[] {
  const moved = step === 2 ? 'new' : 'normal';
  return [
    { name: 'run_id', type: 'UUID', pk: true },
    { name: 'user_id', type: 'UUID', pk: true },
    { name: 'slot', type: 'SMALLINT' },
    { name: 'pos_x', type: 'REAL', state: moved },
    { name: 'pos_y', type: 'REAL', state: moved },
  ];
}

export function CoopSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="migrations" title="Перенос данных в одной миграции">
      <SchemaCard name="Run" columns={runCols(step)} tone="db" state={step === 0 || step === 3 ? 'hl' : 'normal'} className="absolute" style={{ left: 0, top: 0, width: 520 }} />

      <Arrow show={step >= 1} from={[530, 130]} to={[792, 130]} tone={step === 2 ? 'git' : 'muted'} flow={step === 2} width={3} label={step >= 2 ? 'INSERT … SELECT' : 'CREATE TABLE'} labelOffset={[0, -30]} />

      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: 800, top: 0, width: 640 }}>
        <SchemaCard name="RunPlayer" columns={playerCols(step)} tone="git" state={step >= 1 && step <= 2 ? 'hl' : 'normal'} badge={<span className="text-[17px] font-semibold text-git">новая · отряд до 4</span>} />
      </Reveal>

      <div className="absolute" style={{ left: 0, top: 290, width: 1440 }}>
        <Swap k={step}>
          <Code code={CODE[step]} lang="sql" size="sm" title="…_coop-run-players-up.sql" hl={step === 3 ? [2, 3, 6] : undefined} tone="git" />
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'Было: у забега один игрок — его позиция прямо в Run',
          'Стало: отряд — новая таблица RunPlayer, по строке на участника',
          'Бэкфилл в той же миграции: каждый старый забег = отряд из одного',
          <>
            Колонки из Run — убрать, а <M>UNIQUE</M> поменять вместе со смыслом
          </>,
        ]}
      />
    </SlideLayout>
  );
}
