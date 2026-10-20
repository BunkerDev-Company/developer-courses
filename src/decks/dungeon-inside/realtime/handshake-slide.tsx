'use client';

import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import type { SlideProps } from '@/types';
import { Card } from '../parts';

/**
 * Шаги:
 * 0 — клиент открывает сокет и кладёт JWT в auth рукопожатия
 * 1 — сервер проверяет токен ОДИН раз, до подключения: userId и роль — в socket.data
 * 2 — плохой токен: next(new Error('UNAUTHORIZED')) → у клиента connect_error
 * 3 — @WsUserId(): userId только из socket.data, никогда из тела сообщения
 */

// dungeon-frontend/src/net/socket.ts — connectSocket, выдержка.
const CLIENT = `const s = io(\`\${WS_URL}/game\`, {
  auth: { token },
  transports: ['websocket'],
});`;

// dungeon-backend/src/gateways/game.gateway.ts — afterInit, выдержка (verify перенесён по ширине).
const SERVER = `ns.use((socket, next) => {
  const token: unknown = socket.handshake.auth?.token;
  try {
    if (typeof token !== 'string') throw new Error('no token');
    const payload =
      this.jwtService.verify<{ sub: string; role: string }>(token);
    socket.data.userId = payload.sub;
    socket.data.role = payload.role;
    next();
  } catch {
    // Клиент получит connect_error с message === 'UNAUTHORIZED'.
    next(new Error('UNAUTHORIZED'));
  }
});`;

// common/decorators/ws-user.decorator.ts — комментарий перенесён по ширине.
const DECORATOR = `/**
 * Аналог @CurrentUserId() для сокетов. userId кладёт GameGateway
 * при рукопожатии, проверив JWT, — дальше ему можно доверять.
 * Из тела сообщения userId не берём НИКОГДА: его клиент может
 * подставить любой.
 */
export const WsUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const socket = ctx.switchToWs().getClient<Socket>();
    return socket.data.userId as string;
  },
);`;

const LEFT_W = 520;
const RX = LEFT_W + 40;
const RW = 1440 - RX;

export function HandshakeSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="realtime" title="Авторизация — на рукопожатии">
      <div className="absolute" style={{ left: 0, top: 0, width: LEFT_W }}>
        <Code code={CLIENT} lang="ts" size="sm" title="фронт · net/socket.ts" hl={step === 0 ? [2] : undefined} tone="client" />
        <div className="mt-6">
          <Swap k={step}>
            {step === 0 && (
              <Card tone="client" title="Токен — один раз">
                <div className="text-[23px] leading-snug">Тот же JWT, что для REST. Но не в каждом сообщении, а при подключении.</div>
              </Card>
            )}
            {step === 1 && (
              <Card tone="guard" title="Как guard, только для сокета">
                <div className="text-[23px] leading-snug">
                  Проверка до подключения. Дальше в <M>socket.data</M> лежат userId и роль.
                </div>
              </Card>
            )}
            {step === 2 && (
              <Code
                code={`s.on('connect_error', (err) => {
  …
  if (err.message === 'UNAUTHORIZED') {
    disconnectSocket();
    opts.onUnauthorized();
  }
});`}
                lang="ts"
                size="sm"
                title="фронт · тот же connectSocket"
                hl={[3, 5]}
                tone="danger"
              />
            )}
            {step === 3 && (
              <Card tone="danger" title="Почему не из тела">
                <div className="font-mono text-[20px] text-danger line-through decoration-2">{"emit('chest:open', { userId: 'чужой' })"}</div>
                <div className="mt-2 text-[23px] leading-snug">Тело пишет клиент — подставит любой id.</div>
              </Card>
            )}
          </Swap>
        </div>
      </div>

      <div className="absolute" style={{ left: RX, top: 0, width: RW }}>
        <Swap k={step === 3 ? 'decorator' : 'server'}>
          {step === 3 ? (
            <Code code={DECORATOR} lang="ts" size="sm" title="common/decorators/ws-user.decorator.ts" hl={[4, 5, 10]} tone="guard" />
          ) : (
            <Code
              code={SERVER}
              lang="ts"
              size="sm"
              title="gateways/game.gateway.ts — afterInit"
              hl={step === 1 ? range(2, 9) : step === 2 ? [10, 11, 12] : undefined}
              tone={step === 2 ? 'danger' : 'guard'}
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 0 ? 'client' : step === 2 ? 'danger' : 'guard'}
        captions={[
          <>
            Игра открывает сокет и кладёт JWT в <M>auth</M> рукопожатия
          </>,
          <>
            Сервер проверяет токен один раз и кладёт userId в <M>socket.data</M>
          </>,
          'Токен плохой — соединения не будет: клиент получает UNAUTHORIZED',
          <>
            <M>@WsUserId()</M> — userId только из socket.data, никогда из тела
          </>,
        ]}
      />
    </SlideLayout>
  );
}
