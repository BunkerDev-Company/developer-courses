'use client';

import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { codeH } from '../parts';

/**
 * Шаги:
 * 0 — таблица журнала денег, как её создала миграция
 * 1 — prisma:pull: Prisma прочитала базу и написала модель — типы и @@unique
 * 2 — что Prisma не перенесла: CHECK. Его дублирует тип в коде
 */

// …_wallet-up.sql — выдержка.
const SQL = `CREATE TABLE "WalletTransaction"
(
    …
    amount         INTEGER      NOT NULL,
    balance_after  INTEGER      NOT NULL,
    reason         VARCHAR(20)  NOT NULL,
    ref            VARCHAR(100) NOT NULL,
    …
    CONSTRAINT chk_wallet_tx_reason
        CHECK (reason IN ('chest', 'upgrade', 'admin')),
    CONSTRAINT uq_wallet_tx_user_ref UNIQUE (user_id, ref)
);`;

// src/infrastructure/prisma/schema.prisma — выдержка.
const MODEL = `model WalletTransaction {
  …
  amount         Int
  balance_after  Int
  reason         String   @db.VarChar(20)
  ref            String   @db.VarChar(100)
  …
  @@unique([user_id, ref], map: "uq_wallet_tx_user_ref")
}`;

// src/application/services/wallet.service.ts
const REASON = `/** Совпадает с CHECK chk_wallet_tx_reason. */
export type WalletReason =
  'chest' | 'upgrade' | 'admin' | 'loot';`;

const W = 710;
const RX = 1440 - W;

export function PullSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="prisma" title="db pull: таблица → модель">
      <Code
        code={SQL}
        lang="sql"
        size="sm"
        title="…_wallet-up.sql — так создала миграция"
        hl={step === 1 ? [4, 5, 6, 7, 11] : step === 2 ? [6, 9, 10] : undefined}
        tone={step === 2 ? 'danger' : 'git'}
        className="absolute"
        style={{ left: 0, top: 0, width: W }}
      />

      <Arrow show={step >= 1} from={[W + 4, 140]} to={[RX - 6, 140]} tone="prisma" width={3} flow={step === 1} />
      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: RX, top: 0, width: W }}>
        <Code code={MODEL} lang="prisma" size="sm" title="schema.prisma — так прочитала Prisma" hl={step === 1 ? [3, 4, 5, 6, 8] : step === 2 ? [5] : undefined} tone="prisma" />
      </Reveal>

      <Reveal show={step === 2} from="up" delay={0.15} className="absolute" style={{ left: RX, top: codeH(9) + 24, width: W }}>
        <Code code={REASON} lang="ts" size="sm" title="wallet.service.ts — список значений руками" hl={[1, 2, 3]} tone="prisma" />
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 2 ? 'danger' : 'prisma'}
        captions={[
          'Журнал денег — таблица из миграции wallet',
          <>
            <M>prisma:pull</M>: INTEGER → Int, VARCHAR → String, UNIQUE → <M>@@unique</M>
          </>,
          <>
            CHECK Prisma не переносит: <M>reason</M> в типах — просто string, список держим сами
          </>,
        ]}
      />
    </SlideLayout>
  );
}
