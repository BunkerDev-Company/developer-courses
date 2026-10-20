'use client';

import { Users } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { DataTable, type DataRow } from '@/components/ui/data-table';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import type { SlideProps } from '@/types';
import { Console } from '../parts';

/**
 * Шаги:
 * 0 — сразу NOT NULL нельзя: у старых строк нет значения → ошибка; поэтому колонка nullable
 * 1 — бэкфилл: ник из email (admin@example.com → admin)
 * 2 — у всех есть значение → SET NOT NULL
 * 3 — уникальность без учёта регистра: индекс по выражению lower(nickname)
 */

// migrations/sqls/20261001120000_user-nickname-up.sql — выдержка, строки перенесены по ширине.
const UP_SQL = `-- 1) Колонка без NOT NULL
ALTER TABLE "User" ADD COLUMN nickname VARCHAR(32);

-- 2) Бэкфилл. … admin@example.com -> admin.
UPDATE "User"
SET nickname = left(regexp_replace(split_part(email, '@', 1),
                    '[^A-Za-z0-9_]', '_', 'g'), 32)
WHERE nickname IS NULL
  AND email IS NOT NULL;

-- 3) У всех строк есть значение — теперь можно запретить NULL.
ALTER TABLE "User" ALTER COLUMN nickname SET NOT NULL;

CREATE UNIQUE INDEX idx_user_nickname_lower
    ON "User" (lower(nickname));`;

const HL = [[1, 2], range(4, 9), [11, 12], [14, 15]];

const NULL = <span className="text-danger">NULL</span>;

function rows(step: number): DataRow[] {
  const nick = step === 0 ? NULL : <span className="font-semibold text-success">admin</span>;
  const list: DataRow[] = [{ key: 'admin', cells: ['admin@example.com', nick], state: step === 1 ? 'new' : 'normal' }];
  if (step === 3) list.push({ key: 'ADMIN', cells: ['…', 'ADMIN'], state: 'removed' });
  return list;
}

export function NicknameSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="migrations" title="NOT NULL в таблицу со строками">
      <Code
        code={UP_SQL}
        lang="sql"
        size="sm"
        title="…_user-nickname-up.sql"
        hl={HL[step]}
        tone="git"
        className="absolute"
        style={{ left: 0, top: 0, width: 800 }}
      />

      <DataTable
        title={'"User" — до миграции уже есть строка'}
        icon={Users}
        tone="db"
        columns={['email', 'nickname']}
        grid="1fr 200px"
        rows={rows(step)}
        className="absolute"
        style={{ left: 840, top: 0, width: 600 }}
      />

      <div className="absolute" style={{ left: 840, top: 230, width: 600 }}>
        <Swap k={step}>
          {step === 0 && (
            <Console
              title="если сразу NOT NULL:"
              lines={[
                { text: 'ALTER TABLE "User" ADD COLUMN', kind: 'dim' },
                { text: '  nickname VARCHAR(32) NOT NULL;', kind: 'dim' },
                { text: 'ERROR:  column "nickname" of relation', kind: 'err' },
                { text: '"User" contains null values', kind: 'err' },
              ]}
            />
          )}
          {step === 1 && (
            <Console
              title="бэкфилл"
              lines={[
                { text: "split_part('admin@example.com', '@', 1)", kind: 'dim' },
                { text: "→ 'admin'", kind: 'ok' },
                { text: 'без email — второй UPDATE: player_<8 символов id>', kind: 'dim' },
              ]}
            />
          )}
          {step === 2 && (
            <Console title="теперь пустых нет" lines={[{ text: 'ALTER TABLE', kind: 'ok' }, { text: 'nickname NOT NULL ✓', kind: 'ok' }]} />
          )}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <Console
                title={"INSERT … nickname = 'ADMIN'"}
                lines={[
                  { text: 'ERROR:  duplicate key value violates', kind: 'err' },
                  { text: 'unique constraint "idx_user_nickname_lower"', kind: 'err' },
                ]}
              />
              <div className="text-[22px] leading-snug text-text-2">
                В <M>schema.prisma</M> этого индекса не будет — Prisma не описывает индексы по выражению. Но база проверяет его
                всегда
              </div>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'Сразу NOT NULL нельзя: у старых строк нет значения. Сначала колонка без NOT NULL',
          'Бэкфилл: заполняем старые строки — ник из email',
          <>
            Пустых больше нет — теперь <M>SET NOT NULL</M>
          </>,
          <>
            Hero и hero — один игрок: индекс по <M>lower(nickname)</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
