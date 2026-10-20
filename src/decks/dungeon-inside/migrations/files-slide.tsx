'use client';

import { ListOrdered } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { FileTree, type FileItem } from '@/components/ui/file-tree';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { MIGRATION_WRAPPER } from '../data';
import { Card } from '../parts';

/**
 * Шаги:
 * 0 — одна миграция = три файла; порядок — по числу в имени
 * 1 — .ts — обёртка: читает SQL и отдаёт его node-pg-migrate
 * 2 — up.sql — что делаем (сундуки)
 * 3 — down.sql — как откатить; журнал применённых — pgmigrations
 */

const UP_SQL = `CREATE TABLE "ChestOpening"
(
    id             UUID PRIMARY KEY   DEFAULT gen_random_uuid(),
    chest_id       UUID      NOT NULL,
    user_id        UUID      NOT NULL,
    gold           INTEGER   NOT NULL,
    …
    CONSTRAINT uq_chest_opening_chest UNIQUE (chest_id)
);`;

const DOWN_SQL = `DROP TABLE IF EXISTS "ChestOpening";
DROP TABLE IF EXISTS "Chest";`;

function tree(step: number): FileItem[] {
  const st = (s: number) => (step === 0 ? 'hl' : step === s ? 'hl' : 'dim');
  return [
    { name: 'migrations/', depth: 0, kind: 'dir' },
    { name: '…_runs.ts', depth: 1, kind: 'ts', state: 'dim' },
    { name: '20261001120500_chests.ts', depth: 1, kind: 'ts', state: st(1), note: step === 1 ? '← обёртка' : undefined },
    { name: '…_player-upgrades.ts', depth: 1, kind: 'ts', state: 'dim' },
    { name: 'README.md', depth: 1, kind: 'file', state: 'dim' },
    { name: 'sqls/', depth: 1, kind: 'dir', state: 'dim' },
    { name: '20261001120500_chests-up.sql', depth: 2, kind: 'sql', state: st(2), note: step === 2 ? '← что делаем' : undefined },
    { name: '20261001120500_chests-down.sql', depth: 2, kind: 'sql', state: st(3), note: step === 3 ? '← как откатить' : undefined },
  ];
}

export function FilesSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="migrations" title="Миграция — три файла">
      <FileTree items={tree(step)} className="absolute" style={{ left: 0, top: 0, width: 600 }} />

      <div className="absolute" style={{ left: 0, top: 380, width: 600 }}>
        <Card tone="git" icon={ListOrdered} title="Порядок — по числу в имени">
          <div className="font-mono text-[20px]">
            <span className="text-git">20261001120500</span>
            <span className="text-text-2">_chests</span>
          </div>
          <div className="mt-1 text-[20px] text-text-2">дата и время: год, месяц, день, часы, минуты, секунды</div>
        </Card>
      </div>

      <div className="absolute" style={{ left: 640, top: 0, width: 800 }}>
        <Swap k={step}>
          {step === 0 && (
            <Card tone="git" title="Миграция переводит базу из версии N в N+1">
              <div className="flex flex-col gap-2 text-[24px]">
                <span>
                  <M>up</M> — вперёд, <M>down</M> — назад
                </span>
                <span>лежит в гите рядом с кодом — база у всех одинаковая</span>
                <span className="text-text-2">«зашёл в pgAdmin и добавил колонку руками» — у нас не бывает</span>
              </div>
            </Card>
          )}
          {step === 1 && <Code code={MIGRATION_WRAPPER} lang="ts" size="sm" title="migrations/20261001120500_chests.ts" hl={[1, 2, 3, 6, 10]} tone="git" />}
          {step === 2 && <Code code={UP_SQL} lang="sql" size="sm" title="sqls/20261001120500_chests-up.sql" hl={[1, 8]} tone="git" />}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <Code code={DOWN_SQL} lang="sql" size="sm" title="sqls/20261001120500_chests-down.sql" tone="git" />
              <Code code={'SELECT * FROM pgmigrations ORDER BY id;   -- что уже применено'} lang="sql" size="sm" title="журнал применённых — в той же базе" />
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'Каждая миграция игры — три файла: обёртка, up и down',
          <>
            Обёртка одинаковая: читает SQL с диска и отдаёт <M>pgm.sql()</M>
          </>,
          'up.sql — обычный SQL: здесь создаём таблицу открытий сундуков',
          <>
            down.sql — обратно. Что уже применено, раннер смотрит в <M>pgmigrations</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
