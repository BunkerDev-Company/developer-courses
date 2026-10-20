'use client';

import { Check, X } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Console } from '../parts';

/**
 * Шаги:
 * 0 — открытие сундука = четыре записи в одной транзакции
 * 1 — вкладка A: все четыре прошли → COMMIT
 * 2 — вкладка B: тот же сундук → UNIQUE (chest_id) → ROLLBACK целиком, вместе с начислением
 * 3 — catch: P2002 → понятная ошибка CHEST_ALREADY_OPENED
 */

// run-store.service.ts — RunStoreService.openChest, выдержка.
const CODE = `try {
  balance = await this.prisma.$transaction(async (tx) => {
    await tx.chestOpening.create({
      data: { chest_id: chest.id, user_id: userId, gold, … },
    });
    await tx.run.update({ where: { id: runId }, data: { … } });
    await tx.runPlayer.updateMany({ … });
    return this.wallet.credit(
      tx, userId, gold, 'chest', \`chest:\${chest.id}\`,
    );
  });
} catch (e) {
  if (isUniqueViolation(e))
    this.errors.throw('CHEST_ALREADY_OPENED', 'Этот сундук уже открыт');
  throw e;
}`;

const HL = [range(2, 11), range(3, 10), [3, 4], [12, 13, 14]];

const WRITES = ['ChestOpening — запись об открытии', 'Run.gold_earned += золото', 'RunPlayer.gold_earned += золото', 'Wallet + журнал WalletTransaction'];

const CODE_W = 880;

function Writes({ ok, failAt }: { ok: boolean; failAt?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b-2 border-border bg-surface-2 px-5 py-3">
        <span className="text-[22px] font-bold">{ok ? 'Вкладка A' : 'Вкладка B'}</span>
        <span className={cn('font-mono text-[19px] font-bold', ok ? 'text-success' : 'text-danger')}>{ok ? 'COMMIT' : 'ROLLBACK'}</span>
      </div>
      {WRITES.map((w, i) => {
        const failed = !ok && failAt === i;
        const skipped = !ok && failAt !== undefined && i > failAt;
        return (
          <div
            key={w}
            className={cn(
              'flex items-center gap-3 border-b border-border/70 px-5 py-2.5 text-[21px]',
              failed && 'bg-danger/10 text-danger',
              skipped && 'opacity-35',
            )}
          >
            {ok ? <Check size={22} className="shrink-0 text-success" /> : <X size={22} className="shrink-0 text-danger" />}
            <span className={cn(!ok && 'line-through decoration-2')}>{w}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TxSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="prisma" title="$transaction: всё или ничего">
      <Code
        code={CODE}
        lang="ts"
        size="sm"
        title="application/services/run-store.service.ts — openChest"
        hl={HL[step]}
        tone={step >= 2 ? 'danger' : 'prisma'}
        className="absolute"
        style={{ left: 0, top: 0, width: CODE_W }}
      />

      <div className="absolute" style={{ left: CODE_W + 36, top: 0, width: 1440 - CODE_W - 36 }}>
        <Swap k={step}>
          {step === 0 && (
            <div className="card px-5 py-4">
              <div className="text-[24px] font-bold">Четыре записи — одна транзакция</div>
              <ol className="mt-3 flex flex-col gap-2 text-[21px]">
                {WRITES.map((w, i) => (
                  <li key={w}>
                    <span className="font-mono text-prisma">{i + 1}.</span> {w}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {step === 1 && <Writes ok />}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <Writes ok={false} failAt={0} />
              <Console
                title="Postgres"
                lines={[
                  { text: 'duplicate key value violates', kind: 'err' },
                  { text: 'unique constraint', kind: 'err' },
                  { text: '"uq_chest_opening_chest"', kind: 'err' },
                ]}
              />
            </div>
          )}
          {step === 3 && (
            <Console
              title="ответ вкладке B"
              lines={[
                { text: '409', kind: 'dim' },
                { text: '"code": 82,', kind: 'err' },
                { text: '"message":', kind: 'err' },
                { text: '  "Chest Already Opened",', kind: 'err' },
                { text: '"details":', kind: 'err' },
                { text: '  "Этот сундук уже открыт"', kind: 'err' },
              ]}
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step >= 2 ? 'danger' : 'prisma'}
        captions={[
          <>
            Открыть сундук = четыре записи, и все они внутри <M>$transaction</M>
          </>,
          'Вкладка A: все четыре записи прошли — COMMIT, золото начислено',
          'Вкладка B: UNIQUE (chest_id) — откат целиком, вместе с начислением',
          <>
            <M>isUniqueViolation</M> (P2002) → понятная ошибка <M>CHEST_ALREADY_OPENED</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
