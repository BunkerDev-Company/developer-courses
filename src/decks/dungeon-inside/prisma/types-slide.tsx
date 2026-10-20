'use client';

import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { Card, codeH } from '../parts';

/**
 * Шаги:
 * 0 — модель уровня улучшения: составной первичный ключ (игрок, улучшение)
 * 1 — generate: из @@id Prisma делает поле поиска user_id_code — так ищет хендлер лавки
 * 2 — findUnique может вернуть null → компилятор заставляет обработать: current?.level ?? 0
 */

// schema.prisma — модель целиком, кроме опций связи.
const MODEL = `model PlayerUpgrade {
  user_id        String   @db.Uuid
  code           String   @db.VarChar(30)
  level          Int      @default(0)
  date_update_at DateTime @default(now()) @db.Timestamp(6)
  User           User     @relation(fields: [user_id], …)

  @@id([user_id, code], map: "pk_player_upgrade")
}`;

// shop-commands.handler.ts — BuyUpgradeHandler.execute, выдержка.
const HANDLER = `const current = await this.prisma.playerUpgrade.findUnique({
  where: { user_id_code: { user_id: userId, code } },
});
const level = (current?.level ?? 0) + 1;`;

const W = 760;
const RX = W + 40;
const LOW = codeH(8) + 28;

export function TypesSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="prisma" title="generate: модель → типы">
      <Code
        code={MODEL}
        lang="prisma"
        size="sm"
        title="schema.prisma"
        hl={step === 0 ? [2, 3, 8] : step === 1 ? [8] : [4]}
        tone="prisma"
        className="absolute"
        style={{ left: 0, top: 0, width: W }}
      />

      <Arrow show={step >= 1} from={[W / 2, LOW - 26]} to={[W / 2, LOW - 4]} tone="prisma" width={3} />
      <Reveal show={step >= 1} from="up" className="absolute" style={{ left: 0, top: LOW, width: W }}>
        <Code code={HANDLER} lang="ts" size="sm" title="shop-commands.handler.ts" hl={step === 1 ? [1, 2] : [4]} tone="prisma" />
      </Reveal>

      <div className="absolute" style={{ left: RX, top: 0, width: 1440 - RX }}>
        <Swap k={step}>
          {step === 0 && (
            <Card tone="prisma" title="Составной первичный ключ">
              <div className="text-[24px] leading-snug">
                У игрока один уровень на улучшение: пара <M>(user_id, code)</M> уникальна. Отдельного <M>id</M> нет.
              </div>
            </Card>
          )}
          {step === 1 && (
            <Card tone="prisma" title={<>Имя поиска — из полей ключа</>}>
              <div className="text-[24px] leading-snug">
                <M>user_id</M> + <M>code</M> → <M>user_id_code</M>. Опечатку в имени поля поймает компилятор, а не игрок.
              </div>
            </Card>
          )}
          {step === 2 && (
            <Card tone="prisma" title={<>Тип результата: <M>PlayerUpgrade | null</M></>}>
              <div className="text-[24px] leading-snug">
                Улучшение ещё не покупали — строки нет. Написать <M>current.level</M> без проверки TypeScript не даст.
              </div>
            </Card>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="prisma"
        captions={[
          <>
            Уровень улучшения: ключ — пара (игрок, улучшение), <M>@@id</M>
          </>,
          <>
            generate сделал поле поиска <M>user_id_code</M> — им ищет лавка
          </>,
          <>
            findUnique может вернуть null — поэтому <M>current?.level ?? 0</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
