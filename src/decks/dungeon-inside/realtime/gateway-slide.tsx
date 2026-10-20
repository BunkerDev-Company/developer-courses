'use client';

import { Cog, PackageOpen } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { codeH } from '../parts';

/**
 * Шаги:
 * 0 — сокет: @SubscribeMessage('chest:open') — тонкий, как контроллер
 * 1 — REST: POST /runs/:runId/chests/:chestId/open — то же самое
 * 2 — оба создают OpenChestCommand → один и тот же OpenChestHandler
 * 3 — чего в команде НЕТ: координат игрока и золота
 */

// gateways/game.gateway.ts — выдержка (return перенесён по ширине).
const WS = `@SubscribeMessage('chest:open')
openChest(
  @WsUserId() userId: string,
  @MessageBody('chestId', ParseUUIDPipe) chestId: string,
) {
  return this.commandBus.execute(
    new OpenChestCommand(userId, '', chestId),
  );
}`;

// controllers/runs.controller.ts — выдержка (return перенесён по ширине).
const REST = `@UseGuards(JwtAuthGuard)
@Post(':runId/chests/:chestId/open')
openChest(
  @CurrentUserId() userId: string,
  @Param('runId', ParseUUIDPipe) runId: string,
  @Param('chestId', ParseUUIDPipe) chestId: string,
) {
  return this.commandBus.execute(
    new OpenChestCommand(userId, runId, chestId),
  );
}`;

const W = 700;
const RX = 1440 - W;
const BOT = codeH(11) + 34;

export function GatewaySlide({ step }: SlideProps) {
  return (
    <SlideLayout section="realtime" title="Гейтвей — тот же контроллер">
      <Code code={WS} lang="ts" size="sm" title="сокет · gateways/game.gateway.ts" hl={step === 0 ? [1, 3, 4] : step === 2 ? [7] : undefined} tone="logic" className="absolute" style={{ left: 0, top: 0, width: W }} />

      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: RX, top: 0, width: W }}>
        <Code code={REST} lang="ts" size="sm" title="REST · controllers/runs.controller.ts" hl={step === 1 ? [1, 2, 4] : step === 2 ? [9] : undefined} tone="ctrl" />
      </Reveal>

      <Arrow show={step >= 2} from={[W / 2, codeH(9) + 6]} to={[510, BOT - 6]} curve={20} tone="logic" flow={step === 2} width={3} />
      <Arrow show={step >= 2} from={[RX + W / 2, codeH(11) + 6]} to={[930, BOT - 6]} curve={-20} tone="ctrl" flow={step === 2} width={3} />

      <div className="absolute" style={{ left: 220, top: BOT, width: 1000 }}>
        <Swap k={step < 2 ? 'none' : step === 2 ? 'cmd' : 'note'}>
          {step === 2 && (
            <div className="flex items-center justify-center gap-6">
              <NodeBox tone="logic" icon={PackageOpen} title="OpenChestCommand" sub="userId, runId, chestId" size="sm" state="active" style={{ width: 360 }} />
              <span className="text-[30px] text-muted">→</span>
              <NodeBox tone="logic" icon={Cog} title="OpenChestHandler" sub="ему всё равно, откуда" size="sm" state="active" style={{ width: 360 }} />
            </div>
          )}
          {step === 3 && (
            <div className="rounded-2xl border-2 border-dashed border-logic/40 bg-logic/5 px-6 py-4 text-[23px] leading-snug">
              «Обратите внимание, чего здесь <b>НЕТ</b>: координат игрока и количества золота.» Где стоит игрок, сервер знает сам, а золото решил при спавне сундука.
              <div className="mt-1 font-mono text-[17px] text-text-2">application/commands/chest.commands.ts</div>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 1 ? 'ctrl' : 'logic'}
        captions={[
          <>
            <M>@SubscribeMessage</M> — как <M>@Post</M>: сообщение → команда → шина
          </>,
          'То же открытие сундука есть и в REST — удобно проверить в Swagger',
          'Обе двери ведут к одной команде и одному хендлеру',
          'В команде нет ни координат, ни золота — их сервер знает сам',
        ]}
      />
    </SlideLayout>
  );
}
