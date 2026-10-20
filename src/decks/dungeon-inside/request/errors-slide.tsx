'use client';

import { FileLock2 } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { EX } from '../data';
import { Card } from '../parts';

/**
 * Шаги:
 * 0 — каталог ошибок игры: свой блок кодов на каждый домен
 * 1 — REST: NOT_ENOUGH_GOLD в конверте GlobalExceptionFilter
 * 2 — WebSocket: TOO_FAR из chest:open — тот же конверт, но в ack (WsEnvelopeInterceptor)
 * 3 — почему в сокетах интерсептор, а не фильтр
 */

// common/errors/app-errors.ts — выдержка (разделители укорочены).
const CATALOG = `// ── Игрок и кошелёк ──
NICKNAME_TAKEN: { code: 70, …, httpStatus: 409 },
NOT_ENOUGH_GOLD: { code: 71, message: 'Not Enough Gold', … },
UPGRADE_MAXED: { code: 73, …, httpStatus: 409 },
// ── Забег, сундуки, волны ──
CHEST_ALREADY_OPENED: { code: 82, …, httpStatus: 409 },
TOO_FAR: { code: 83, message: 'Too Far', httpStatus: 403 },
WAVE_TOO_FAST: { code: 85, …, httpStatus: 400 },
// ── Комнаты и неткод (этап 2) ──
ROOM_FULL: { code: 101, …, httpStatus: 409 },
NOT_HOST: { code: 102, …, httpStatus: 403 },`;

const HL = [[1, 5, 9], [3], [7], []];

const REST_JSON = `{
  "error": {
    "code": 71,
    "message": "Not Enough Gold",
    "httpStatus": 409,
    "details": "Нужно ${EX.price} золота"
  },
  "endpoint": "/api/v1/shop/${EX.upgrade}/buy", …
}`;

const WS_JSON = `{
  "error": {
    "code": 83,
    "message": "Too Far",
    "httpStatus": 403,
    "details": "До сундука 3.4 тайла, …"
  },
  "endpoint": "ws:chest:open", …
}`;

const CODE_W = 850;
const RX = CODE_W + 36;

export function GameErrorsSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="request" title="Ошибки игры: каталог кодов">
      <Code
        code={CATALOG}
        lang="ts"
        size="sm"
        title="common/errors/app-errors.ts"
        hl={HL[step].length ? HL[step] : undefined}
        tone="danger"
        className="absolute"
        style={{ left: 0, top: 0, width: CODE_W }}
      />

      <div className="absolute" style={{ left: RX, top: 0, width: 1440 - RX }}>
        <Swap k={step}>
          {step === 0 && (
            <Card tone="danger" icon={FileLock2} title="Коды — публичный контракт">
              <div className="flex flex-col gap-2 text-[23px] leading-snug">
                <span>Не переиспользуйте и не перенумеровывайте.</span>
                <span>Новый домен — новый блок кодов: 70+, 80+, 100+.</span>
                <span className="text-text-2">Фронт ветвится по code, а не по тексту.</span>
              </div>
            </Card>
          )}
          {step === 1 && <Code code={REST_JSON} lang="json" size="sm" title="REST · HTTP 409 · GlobalExceptionFilter" hl={[3, 6]} tone="danger" />}
          {step === 2 && <Code code={WS_JSON} lang="json" size="sm" title="WebSocket · ack · WsEnvelopeInterceptor" hl={[3, 6, 8]} tone="danger" />}
          {step === 3 && (
            <Card tone="danger" title="Почему в сокетах — интерсептор">
              <div className="flex flex-col gap-2 text-[22px] leading-snug">
                <span>Глобальные фильтры Nest на гейтвеи не действуют.</span>
                <span>Фильтр в WS умеет только отдельное событие «exception» — ответить в ack он не может.</span>
                <span className="font-semibold">Интерсептор ловит ошибку и возвращает её как обычный результат.</span>
              </div>
            </Card>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="danger"
        captions={[
          'Каталог ошибок игры: свой блок кодов на каждую часть игры',
          <>
            REST: не хватило золота — 409, <M>code 71</M>, details — для тоста
          </>,
          <>
            Сокет: тот же конверт, только в ack на <M>chest:open</M>
          </>,
          'Один формат ошибок для REST и сокетов — фронт разбирает их одинаково',
        ]}
      />
    </SlideLayout>
  );
}
