'use client';

import { ArrowLeftRight, Globe, Radio } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Card, Console } from '../parts';

/**
 * Шаги:
 * 0 — REST: спросил — ответили. Всё, что не в реальном времени
 * 1 — WebSocket /game: одно соединение на всю игру, сообщения в обе стороны
 * 2 — реальный лог старта: гейтвей подписался на события
 * 3 — три вида сообщений по сокету: с ack, без ack, пуш от сервера
 */

// Вывод старта dungeon-backend; префикс «[Nest] PID - дата, время LOG» обрезан.
const BOOT = [
  '[WebSocketsController] GameGateway subscribed to the "room:create" message',
  '[WebSocketsController] GameGateway subscribed to the "room:start" message',
  '[WebSocketsController] GameGateway subscribed to the "input" message',
  '[WebSocketsController] GameGateway subscribed to the "chest:open" message',
  '[WebSocketsController] GameGateway subscribed to the "reward:pick" message',
  '… и ещё 11: room:join, room:leave, wave:ready, portal:enter, net:ping …',
];

const KINDS: { dir: string; name: string; kind: string; tone: string }[] = [
  { dir: '→', name: 'room:create, chest:open, reward:pick', kind: 'с ack — ждём ответ в конверте', tone: 'text-ctrl' },
  { dir: '→', name: 'input ~30/с', kind: 'без ack — ответ не нужен', tone: 'text-client' },
  { dir: '←', name: 'snap 20/с', kind: 'бинарный снимок мира', tone: 'text-logic' },
  { dir: '←', name: 'wallet:update, run:event', kind: 'JSON-пуш от сервера', tone: 'text-logic' },
];

export function ChannelsSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="realtime" title="Два канала: REST и WebSocket">
      <div className="absolute grid grid-cols-2 gap-10" style={{ left: 0, top: 0, width: 1440 }}>
        <Card tone="ctrl" icon={Globe} title="REST · /api/v1" active={step === 0}>
          <div className="flex flex-col gap-2 text-[23px] leading-snug">
            <span>Спросил — ответили — соединение свободно.</span>
            <span className="text-text-2">Вход, профиль, кошелёк, лавка, рекорды, админка, текущий забег.</span>
          </div>
        </Card>
        <Reveal show={step >= 1} from="left">
          <Card tone="logic" icon={Radio} title="WebSocket · /game" active={step === 1}>
            <div className="flex flex-col gap-2 text-[23px] leading-snug">
              <span className="flex items-center gap-2">
                <ArrowLeftRight size={24} className="shrink-0 text-logic" /> Одно соединение на всю игру, сообщения в обе стороны.
              </span>
              <span className="text-text-2">Комнаты, бой, сундуки, награды, пуш баланса.</span>
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="absolute" style={{ left: 0, top: 230, width: 1440 }}>
        <Swap k={step < 2 ? 'none' : step}>
          {step === 2 && <Console title="npm run start:dev — начало строк обрезано" lines={BOOT.map((t, i) => ({ text: t, kind: i === 2 ? 'ok' : i === 5 ? 'dim' : 'out' }))} />}
          {step === 3 && (
            <div className="card overflow-hidden">
              {KINDS.map((k) => (
                <div key={k.name} className="grid items-center gap-6 border-b border-border/70 px-6 py-3.5" style={{ gridTemplateColumns: '40px 520px 1fr' }}>
                  <span className={cn('font-mono text-[28px] font-bold', k.tone)}>{k.dir}</span>
                  <span className={cn('font-mono text-[22px] font-semibold', k.tone)}>{k.name}</span>
                  <span className="text-[23px] text-text-2">{k.kind}</span>
                </div>
              ))}
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 0 ? 'ctrl' : 'logic'}
        captions={[
          'REST — всё, что не в реальном времени: как в магазине',
          'WebSocket — соединение держится всю игру, писать может и сервер',
          'При старте Nest подписывает гейтвей на события — как маршруты контроллеров',
          'По сокету три вида сообщений: с ответом, без ответа и пуш от сервера',
        ]}
      />
    </SlideLayout>
  );
}
