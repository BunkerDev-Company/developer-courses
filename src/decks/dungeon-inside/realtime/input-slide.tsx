'use client';

import { Zap } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { Card, Console } from '../parts';

/**
 * Шаги:
 * 0 — клиент шлёт ввод: номер первого шага + шаги [dx, dy, кнопки], без ack
 * 1 — гейтвей: input не возвращает ничего и идёт прямо в RoomsService — мимо шины
 * 2 — RoomsService.input: мусор молча выбрасываем
 * 3 — почему мимо шины: 120 сообщений в секунду на комнату
 */

// domain/shared/protocol.ts — общий для сервера и клиента.
const PACKET = `export interface InputPacket {
  s: number;
  i: [number, number, number][];
}`;

// dungeon-frontend/src/net/socket.ts
const SEND = `/** Шаги ввода — без ack. Ненадёжные: … */
export function sendInput(packet: InputPacket): void {
  …
  netsim.schedule(() => s.emit('input', packet), true);
}`;

// gateways/game.gateway.ts — комментарий перенесён по ширине.
const GATEWAY = `/** Шаги ввода. Без ack, мимо шины — горячий путь.
 *  Ошибки молча игнорируем. */
@SubscribeMessage('input')
input(@WsUserId() userId: string, @MessageBody() body: InputPacket) {
  this.rooms.input(userId, body);
}`;

// application/services/rooms.service.ts — RoomsService.input, выдержка.
const ROOMS = `if (!packet || !Number.isInteger(packet.s) || packet.s < 0 ||
    !Array.isArray(packet.i)) return;
const steps = packet.i
  .slice(0, 12)
  .filter(
    (st): st is [number, number, number] =>
      Array.isArray(st) &&
      st.length === 3 &&
      st.every((v) => typeof v === 'number' && Number.isFinite(v)),
  );
room.sim.applyInputs(m.pid, packet.s, steps, Date.now());`;

const LW = 560;
const RX = LW + 40;
const RW = 1440 - RX;

export function InputSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="realtime" title="Горячий путь: input мимо шины">
      <div className="absolute flex flex-col gap-5" style={{ left: 0, top: 0, width: LW }}>
        <Code code={PACKET} lang="ts" size="sm" title="domain/shared/protocol.ts" hl={step === 0 ? [2, 3] : undefined} tone="client" />
        <Console
          title="что летит ~30 раз в секунду"
          lines={[
            { text: "emit('input', {", kind: 'out' },
            { text: '  s: 1840,              // номер первого шага', kind: 'dim' },
            { text: '  i: [[100, 0, 0], [100, 0, 0]],', kind: 'ok' },
            { text: '  // dx, dy: −100..100; кнопки: 1 = рывок', kind: 'dim' },
            { text: '})', kind: 'out' },
          ]}
        />
      </div>

      <div className="absolute" style={{ left: RX, top: 0, width: RW }}>
        <Swap k={step}>
          {step === 0 && <Code code={SEND} lang="ts" size="sm" title="фронт · net/socket.ts" hl={[1, 4]} tone="client" />}
          {step === 1 && <Code code={GATEWAY} lang="ts" size="sm" title="gateways/game.gateway.ts" hl={[3, 4, 5]} tone="logic" />}
          {step === 2 && <Code code={ROOMS} lang="ts" size="sm" title="rooms.service.ts — input()" hl={[1, 2, 4, 9]} tone="logic" />}
          {step === 3 && (
            <Card tone="warning" icon={Zap} title="Почему мимо шины">
              <div className="flex flex-col gap-3 text-[24px] leading-snug">
                <span>
                  4 игрока × 30 пакетов/с = <b>120 сообщений в секунду</b> на комнату.
                </span>
                <span className="text-text-2">Создавать команду, искать хендлер, заворачивать ответ в конверт — на каждое не стоит.</span>
                <span>Всё остальное по сокету — как обычно: команда → шина.</span>
              </div>
            </Card>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 0 ? 'client' : step === 3 ? 'warning' : 'logic'}
        captions={[
          'Не «где я», а «что нажал»: 60 шагов [dx, dy, кнопки] в секунду',
          <>
            <M>input</M> ничего не возвращает — ack нет. И идёт прямо в RoomsService
          </>,
          'Мусор молча выбрасываем: не больше 12 шагов, только конечные числа',
          'Горячий путь мимо шины — 120 сообщений в секунду на комнату',
        ]}
      />
    </SlideLayout>
  );
}
