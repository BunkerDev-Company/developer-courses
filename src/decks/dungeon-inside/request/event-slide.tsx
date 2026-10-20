'use client';

import { motion } from 'framer-motion';
import { BellRing, Cog, MonitorSmartphone, Radio } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { EX } from '../data';

/**
 * Шаги:
 * 0 — событие: третий вид сообщений CQRS — «это уже произошло»
 * 1 — хендлер лавки публикует его после коммита
 * 2 — WalletPushHandler (в gateways/) превращает событие в пуш wallet:update
 * 3 — комната сокетов user:<id>: пуш получают все вкладки игрока
 */

const CODES: { title: string; code: string; hl: number[] }[] = [
  {
    title: 'application/events/wallet-changed.event.ts',
    code: `/**
 * Событие — третий вид сообщений в CQRS (после команд и запросов):
 * «это УЖЕ произошло». Публикуется после коммита транзакции.
 */
export class WalletChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly balance: number,
    public readonly delta: number,
    public readonly reason: string,
  ) {}
}`,
    hl: [2, 3, 5],
  },
  {
    title: 'shop-commands.handler.ts — BuyUpgradeHandler',
    code: `balance = await this.prisma.$transaction(async (tx) => { … });
…
this.eventBus.publish(
  new WalletChangedEvent(userId, balance, -price, 'upgrade'),
);`,
    hl: [3, 4, 5],
  },
  {
    title: 'gateways/wallet-push.handler.ts',
    code: `@EventsHandler(WalletChangedEvent)
export class WalletPushHandler implements IEventHandler<…> {
  constructor(private readonly gateway: GameGateway) {}

  handle(event: WalletChangedEvent) {
    this.gateway.emitToUser(event.userId, 'wallet:update', {
      balance: event.balance,
      delta: event.delta,
      reason: event.reason,
    });
  }
}`,
    hl: [1, 6],
  },
  {
    title: 'gateways/game.gateway.ts — выдержка',
    code: `const userRoom = (userId: string) => \`user:\${userId}\`;
…
async handleConnection(socket: Socket) {
  …
  await socket.join(userRoom(userId));
…
emitToUser(userId: string, event: string, payload: unknown) {
  this.server.to(userRoom(userId)).emit(event, payload);
}`,
    hl: [1, 5, 8],
  },
];

const CODE_W = 860;
const RX = CODE_W + 50;
const RW = 1440 - RX;
const TABS = ['лавка', 'бой', 'телефон'];

export function EventSlide({ step }: SlideProps) {
  const c = CODES[step];
  const on = (i: number) => (step === i ? 'active' : step > i ? 'done' : 'idle');

  return (
    <SlideLayout section="request" title="Событие: баланс во все вкладки">
      <div className="absolute" style={{ left: 0, top: 0, width: CODE_W }}>
        <Swap k={step}>
          <Code code={c.code} lang="ts" size="sm" title={c.title} hl={c.hl} tone="logic" />
        </Swap>
      </div>

      {/* Справа: путь события */}
      <NodeBox tone="logic" icon={Cog} title="BuyUpgradeHandler" sub="после COMMIT" size="sm" state={on(1)} className="absolute" style={{ left: RX, top: 0, width: RW }} />
      <Arrow from={[RX + RW / 2, 76]} to={[RX + RW / 2, 112]} tone={step >= 1 ? 'logic' : 'muted'} flow={step === 1} width={3} label="EventBus" labelOffset={[90, 0]} />
      <NodeBox tone="logic" icon={BellRing} title="WalletPushHandler" sub="@EventsHandler" size="sm" state={on(2)} className="absolute" style={{ left: RX, top: 118, width: RW }} />
      <Arrow from={[RX + RW / 2, 194]} to={[RX + RW / 2, 230]} tone={step >= 2 ? 'logic' : 'muted'} flow={step === 2} width={3} label="wallet:update" labelOffset={[100, 0]} />
      <NodeBox tone="ctrl" icon={Radio} title={`user:${EX.userId}`} sub="комната сокетов игрока" size="sm" state={on(3)} className="absolute" style={{ left: RX, top: 236, width: RW }} />

      <div className="absolute grid grid-cols-3 gap-3" style={{ left: RX, top: 350, width: RW }}>
        {TABS.map((t, i) => (
          <motion.div
            key={t}
            initial={false}
            animate={{ opacity: step === 3 ? 1 : 0.4, y: step === 3 ? 0 : 8 }}
            transition={{ duration: 0.35, delay: step === 3 ? i * 0.1 : 0, ease: EASE }}
            className={cn('card flex flex-col items-center gap-1 px-2 py-3', step === 3 && 'border-client')}
          >
            <MonitorSmartphone size={26} className="text-client" />
            <span className="text-[19px] font-semibold">{t}</span>
            <span className={cn('font-mono text-[20px] font-bold', step === 3 ? 'text-success' : 'text-muted')}>
              {step === 3 ? EX.balanceAfter : EX.balanceBefore}
            </span>
          </motion.div>
        ))}
      </div>

      <StepCaption
        step={step}
        tone="logic"
        captions={[
          <>
            Команда — «сделай», запрос — «дай», событие — «<b>уже произошло</b>»
          </>,
          'Хендлер публикует событие только после коммита — деньги уже списаны',
          <>
            Хендлер лавки не знает про сокеты: пуш делает <M>WalletPushHandler</M>
          </>,
          'Каждая вкладка при подключении входит в комнату user:<id> — баланс обновится везде',
        ]}
      />
    </SlideLayout>
  );
}
