'use client';

import { ReceiptText, ShieldAlert } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { DataTable } from '@/components/ui/data-table';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { EX } from '../data';
import { Card, Console } from '../parts';

/**
 * Шаги:
 * 0 — урок миграции: защиту денег нельзя доверить только коду
 * 1 — CHECK (balance >= 0): в минус база не уйдёт
 * 2 — UNIQUE (user_id, ref): одна операция не проводится дважды
 * 3 — бэкфилл: кошелёк всем, кто уже есть
 */

// migrations/sqls/20261001120100_wallet-up.sql — выдержка.
const UP_SQL = `CREATE TABLE "Wallet"
(
    user_id        UUID PRIMARY KEY,
    balance        INTEGER   NOT NULL DEFAULT 0,
    …
    CONSTRAINT chk_wallet_balance_non_negative CHECK (balance >= 0)
);
CREATE TABLE "WalletTransaction"
(
    …
    ref            VARCHAR(100) NOT NULL,
    CONSTRAINT uq_wallet_tx_user_ref UNIQUE (user_id, ref)
);
INSERT INTO "Wallet" (user_id)
SELECT id FROM "User"
ON CONFLICT (user_id) DO NOTHING;`;

const HL = [[], [4, 6], [11, 12], [14, 15, 16]];

export function WalletSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="migrations" title="Деньги защищает база">
      <Code
        code={UP_SQL}
        lang="sql"
        size="sm"
        title="…_wallet-up.sql"
        hl={HL[step].length ? HL[step] : undefined}
        tone="git"
        className="absolute"
        style={{ left: 0, top: 0, width: 830 }}
      />

      <div className="absolute" style={{ left: 870, top: 0, width: 570 }}>
        <Swap k={step}>
          {step === 0 && (
            <Card tone="danger" icon={ShieldAlert} title="Урок из этой миграции">
              <div className="flex flex-col gap-3 text-[24px] leading-snug">
                <span>Код может забыть проверку.</span>
                <span>Два запроса могут прийти одновременно.</span>
                <span className="font-semibold">Поэтому правила — в самой базе.</span>
                <span className="text-[21px] text-text-2">Золото — целые монеты: INTEGER. Float для денег — никогда.</span>
              </div>
            </Card>
          )}
          {step === 1 && (
            <Console
              title="списать больше, чем есть"
              lines={[
                { text: `-- баланс ${EX.balanceBefore}, списываем 500`, kind: 'dim' },
                { text: 'UPDATE "Wallet" SET balance = balance - 500 …;', kind: 'dim' },
                { text: 'ERROR:  new row for relation "Wallet"', kind: 'err' },
                { text: 'violates check constraint', kind: 'err' },
                { text: '"chk_wallet_balance_non_negative"', kind: 'err' },
              ]}
            />
          )}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <DataTable
                title={'"WalletTransaction"'}
                icon={ReceiptText}
                tone="db"
                columns={['amount', 'reason', 'ref']}
                grid="90px 110px 1fr"
                size="sm"
                rows={[
                  { key: 'a', cells: ['+40', 'chest', `chest:${EX.chestId}`] },
                  { key: 'b', cells: ['+40', 'chest', `chest:${EX.chestId}`], state: 'removed' },
                ]}
              />
              <Console
                title="тот же сундук второй раз"
                lines={[
                  { text: 'ERROR:  duplicate key value violates', kind: 'err' },
                  { text: 'unique constraint "uq_wallet_tx_user_ref"', kind: 'err' },
                ]}
              />
            </div>
          )}
          {step === 3 && (
            <Card tone="git" title="Бэкфилл: INSERT … SELECT">
              <div className="flex flex-col gap-3 text-[24px] leading-snug">
                <span>Кошелёк получает каждый, кто уже зарегистрирован.</span>
                <span className="text-text-2">Новым игрокам кошелёк создаёт код регистрации.</span>
                <span className="text-[21px] text-text-2">
                  <M>ON CONFLICT DO NOTHING</M> — повторный запуск не упадёт
                </span>
              </div>
            </Card>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 1 || step === 2 ? 'danger' : 'git'}
        captions={[
          'Кошелёк и журнал операций: правила денег — в самой базе',
          <>
            <M>CHECK (balance &gt;= 0)</M> — в минус баланс не уйдёт, даже если код ошибся
          </>,
          <>
            <M>UNIQUE (user_id, ref)</M> — за один сундук дважды не начислят
          </>,
          'Бэкфилл: таблица новая, а игроки уже есть — кошелёк каждому',
        ]}
      />
    </SlideLayout>
  );
}
