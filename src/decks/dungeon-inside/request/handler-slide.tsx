'use client';

import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import type { SlideProps } from '@/types';
import { DataLine, DataPanel } from '../../backend-inside/request/b-panel';
import { EX } from '../data';

/**
 * BuyUpgradeHandler.execute по шагам на примере «Сила», уровень 2 → 3:
 * 0 — есть ли такое улучшение
 * 1 — какой уровень следующий и не максимальный ли
 * 2 — цену называет сервер: upgradePrice(code, level)
 * 3 — транзакция: списать + записать уровень
 * 4 — событие после коммита + ответ
 */

// application/handlers/shop-commands.handler.ts — выдержка (try/catch опущен: он про CONFLICT).
const CODE = `if (!isUpgradeCode(code)) this.errors.throw('UPGRADE_NOT_FOUND', …);
const current = await this.prisma.playerUpgrade.findUnique({ … });
const level = (current?.level ?? 0) + 1;
if (level > def.maxLevel) this.errors.throw('UPGRADE_MAXED', …);
const price = upgradePrice(code, level);
balance = await this.prisma.$transaction(async (tx) => {
  const after = await this.wallet.debit(
    tx, userId, price, 'upgrade', \`upgrade:\${code}:\${level}\`,
  );
  await tx.playerUpgrade.upsert({ … });
  return after;
});
this.eventBus.publish(
  new WalletChangedEvent(userId, balance, -price, 'upgrade'),
);
return { code, level, balance, nextPrice: … };`;

const HL = [[1], [2, 3, 4], [5], range(6, 12), range(13, 16)];

const CODE_W = 840;
const RX = CODE_W + 36;
const RW = 1440 - RX;

export function UpgradeHandlerSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="request" title="Хендлер лавки: всё решает сервер">
      <Code
        code={CODE}
        lang="ts"
        size="sm"
        title="shop-commands.handler.ts — BuyUpgradeHandler"
        hl={HL[step]}
        tone="logic"
        className="absolute"
        style={{ left: 0, top: 0, width: CODE_W }}
      />

      <div className="absolute" style={{ left: RX, top: 0, width: RW }}>
        <Swap k={step}>
          {step === 0 && (
            <DataPanel title="UPGRADES — 4 улучшения" tone="logic">
              {['vitality', 'might', 'swiftness', 'greed'].map((c) => (
                <DataLine key={c} text={`'${c}'`} state={c === EX.upgrade ? 'hl' : 'dim'} tone="logic" note={c === EX.upgrade ? '← пришло в пути' : undefined} noteTone="logic" />
              ))}
            </DataPanel>
          )}
          {step === 1 && (
            <DataPanel title="значения" tone="logic">
              <DataLine k="current.level" v="2" />
              <DataLine k="level" v={String(EX.level)} state="hl" tone="logic" />
              <DataLine k="def.maxLevel" v="30" note="3 ≤ 30 — ок" noteTone="success" />
            </DataPanel>
          )}
          {step === 2 && (
            <DataPanel title="domain/game/rules.ts — upgradePrice" tone="logic">
              <DataLine text="Math.round(UPGRADES[code].basePrice" />
              <DataLine text="  * Math.pow(level, 1.3))" />
              <DataLine k="might.basePrice" v="30" />
              <DataLine k="level" v={String(EX.level)} />
              <DataLine k="price" v={String(EX.price)} state="hl" tone="logic" note="30 × 4.17" noteTone="logic" />
            </DataPanel>
          )}
          {step === 3 && (
            <DataPanel title="в одной транзакции" tone="prisma">
              <DataLine k="debit" v={String(EX.price)} />
              <DataLine k="ref" v={`'upgrade:${EX.upgrade}:${EX.level}'`} state="hl" tone="prisma" />
              <DataLine k="PlayerUpgrade.level" v={String(EX.level)} />
              <DataLine k="balance" v={`${EX.balanceBefore} → ${EX.balanceAfter}`} state="hl" tone="prisma" />
            </DataPanel>
          )}
          {step === 4 && (
            <DataPanel title="ответ — data в конверте" tone="success">
              <DataLine k="code" v={`'${EX.upgrade}'`} />
              <DataLine k="level" v={String(EX.level)} />
              <DataLine k="balance" v={String(EX.balanceAfter)} />
              <DataLine k="nextPrice" v={String(EX.nextPrice)} state="hl" tone="success" note="цена 4-го" noteTone="success" />
            </DataPanel>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 3 ? 'prisma' : step === 4 ? 'success' : 'logic'}
        captions={[
          <>
            Код из пути — строка от клиента: сначала проверить, что такое улучшение есть
          </>,
          'Следующий уровень считаем по базе, а не верим клиенту',
          <>
            Цену называет сервер: <M>round(30 × 3^1.3) = {EX.price}</M>
          </>,
          <>
            Списание и уровень — в одной транзакции, <M>ref</M> уникален
          </>,
          'После коммита — событие, игроку — новый баланс и цена следующего уровня',
        ]}
      />
    </SlideLayout>
  );
}
