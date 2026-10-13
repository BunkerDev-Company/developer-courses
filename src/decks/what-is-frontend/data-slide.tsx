'use client';

import { motion } from 'framer-motion';
import { PackageX, Server } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { NodeBox } from '@/components/ui/node-box';
import { Packet } from '@/components/ui/packet';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE, range } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { CodePanel } from './code-panel';
import { money, PRODUCTS } from './data';
import { BrowserWindow, ShopHeader } from './ui';

/**
 * Шаги:
 * 0 — страница открылась: данных нет, скелетоны (isLoading)
 * 1 — запрос GET /api/v1/items летит на бэкенд
 * 2 — ответ 200: JSON с товарами
 * 3 — фронт превращает JSON в карточки (data)
 * 4 — ошибка 500 → вместо карточек понятное сообщение (isError)
 */

// Как в etalon-frontend: items/page.tsx → itemsApi.list() → api.get('/items')
const CODE = `const { data, isLoading, isError } = useQuery({
  queryKey: ['items'],
  queryFn: () => itemsApi.list(), // GET /api/v1/items
});`;

const OK_JSON = `{
  "data": {
    "items": [
      { "title": "Кроссовки", "price": 4990, … },
      { "title": "Рюкзак", "price": 2490, … },
      { "title": "Наушники", "price": 3290, … }
    ],
    "total": 3, "page": 1, "limit": 20
  },
  "responseTime": 12, …
}`;

const ERR_JSON = `{
  "error": {
    "code": 99,
    "message": "Internal Server Error",
    "httpStatus": 500,
    "details": null
  },
  "responseTime": 8, …
}`;

const BROWSER = { left: 0, top: 0, width: 600, height: 300 };
const SERVER = { left: 1120, top: 6, width: 320 };
const LANE_REQ = 34;
const LANE_RES = 82;
const LANE_FROM = BROWSER.width + 8;
const LANE_TO = SERVER.left - 8;
const JSON_BOX = { left: 760, top: 140, width: 680 };

const CODE_HL = [[1], [3], [3], [1], [1]];

function SkeletonCard() {
  return (
    <div className="flex h-full flex-col gap-2.5 rounded-xl border-2 border-border bg-surface p-2.5">
      <div className="h-16 animate-pulse rounded-lg bg-surface-3" />
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-surface-3" />
      <div className="h-4 w-1/2 animate-pulse rounded-full bg-surface-3" />
    </div>
  );
}

function DataCard({ i, hl }: { i: number; hl: boolean }) {
  const p = PRODUCTS[i];
  const t = TONE[p.tone];
  const Icon = p.icon;
  const mark = hl ? 'rounded-md bg-accent/15 px-1 -mx-1 text-accent' : '';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.3 + i * 0.15, ease: EASE }}
      className="flex h-full flex-col gap-1.5 rounded-xl border-2 border-border bg-surface p-2.5"
    >
      <div className={cn('flex h-16 shrink-0 items-center justify-center rounded-lg', t.soft, t.text)}>
        <Icon size={34} strokeWidth={1.75} />
      </div>
      <span className={cn('self-start truncate text-[19px] font-semibold leading-tight', mark)}>{p.title}</span>
      <span className={cn('self-start text-[19px] font-bold leading-tight', mark)}>{money(p.price)}</span>
    </motion.div>
  );
}

function Flag({ name, value, on, tone }: { name: string; value: string; on: boolean; tone: Tone }) {
  return (
    <Chip tone={on ? tone : 'muted'} className={cn('text-[18px] transition-shadow duration-300', on && cn('font-bold', TONE[tone].ring))}>
      {name}: {value}
    </Chip>
  );
}

export function DataSlide({ step }: SlideProps) {
  const loading = step <= 2;
  const error = step === 4;
  const view = error ? 'error' : step === 3 ? 'data' : 'loading';

  return (
    <SlideLayout section="web" title="Фронт просит данные у бэкенда">
      {/* Страница каталога */}
      <BrowserWindow url="shop.ru/catalog" className="absolute" style={BROWSER} bodyClassName="flex flex-col gap-3 bg-bg p-3">
        <ShopHeader count={0} />
        <Swap k={view} className="min-h-0 flex-1">
          {view === 'loading' && (
            <div className="grid h-[150px] grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
          {view === 'data' && (
            <div className="grid h-[150px] grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <DataCard key={i} i={i} hl />
              ))}
            </div>
          )}
          {view === 'error' && (
            <div className="flex h-[150px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-danger/40 bg-danger/5">
              <PackageX size={40} className="text-danger" />
              <div className="text-[22px] font-semibold">Не удалось загрузить товары</div>
              <div className="font-mono text-[17px] text-text-2">Internal Server Error</div>
            </div>
          )}
        </Swap>
      </BrowserWindow>

      {/* Код и что вернул useQuery */}
      <CodePanel code={CODE} lang="tsx" size="sm" title="catalog/page.tsx" hl={CODE_HL[step]} className="absolute" style={{ left: 0, top: 316, width: 700 }} />
      <div className="absolute flex gap-3" style={{ left: 0, top: 522 }}>
        <Flag name="isLoading" value={String(loading)} on={loading} tone="accent" />
        <Flag name="data" value={step === 3 ? '{ items: […] }' : 'undefined'} on={step === 3} tone="success" />
        <Flag name="isError" value={String(error)} on={error} tone="danger" />
      </div>

      {/* Бэкенд */}
      <NodeBox
        tone="logic"
        icon={Server}
        title="Бэкенд"
        sub="NestJS · /api/v1"
        state={step === 1 ? 'active' : step === 2 ? 'done' : error ? 'error' : 'idle'}
        className="absolute"
        style={SERVER}
      />

      {/* Дорожки: запрос → и ← ответ */}
      <Arrow show={step >= 1} from={[LANE_FROM, LANE_REQ]} to={[LANE_TO, LANE_REQ]} tone={step === 1 ? 'accent' : 'muted'} flow={step === 1} width={3} />
      <Arrow
        show={step >= 2}
        from={[LANE_TO, LANE_RES]}
        to={[LANE_FROM, LANE_RES]}
        tone={error ? 'danger' : step === 2 ? 'success' : 'muted'}
        flow={step === 2 || error}
        width={3}
      />
      <Packet at={step >= 1 ? [930, LANE_REQ] : [LANE_FROM + 120, LANE_REQ]} show={step === 1} tone="accent">
        GET /api/v1/items
      </Packet>
      <Packet at={step >= 2 ? [800, LANE_RES] : [LANE_TO - 90, LANE_RES]} show={step === 2} tone="success">
        200 OK · JSON
      </Packet>
      <Packet at={error ? [800, LANE_RES] : [LANE_TO - 90, LANE_RES]} show={error} tone="danger">
        500 · ошибка
      </Packet>

      {/* Ответ сервера: пока его нет — пунктирное место */}
      <motion.div
        className="absolute flex items-center justify-center rounded-2xl border-[3px] border-dashed border-border-2 text-[24px] text-muted"
        style={{ ...JSON_BOX, height: 400 }}
        initial={false}
        animate={{ opacity: step <= 1 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 1 ? 'ждём ответ…' : 'ответа ещё нет'}
      </motion.div>
      <motion.div
        className="absolute"
        style={JSON_BOX}
        initial={false}
        animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
        transition={{ duration: 0.45, delay: step === 2 ? 0.5 : 0, ease: EASE }}
      >
        <Swap k={error ? 'err' : 'ok'}>
          {error ? (
            <CodePanel code={ERR_JSON} lang="json" size="sm" title="ответ · 500" tone="danger" titleTone="danger" hl={range(3, 6)} />
          ) : (
            <CodePanel
              code={OK_JSON}
              lang="json"
              size="sm"
              title="ответ · 200 OK"
              titleTone="success"
              tone="success"
              hl={step === 3 ? range(4, 6) : undefined}
            />
          )}
        </Swap>
      </motion.div>

      {/* JSON → карточки */}
      <Arrow
        show={step === 3}
        from={[JSON_BOX.left - 10, JSON_BOX.top + 44 + 16 + 4.5 * 29.45]}
        to={[BROWSER.width + 12, 250]}
        tone="accent"
        delay={0.2}
        flow
        label=".map"
        labelOffset={[0, 4]}
      />

      <StepCaption
        step={step}
        tone={error ? 'danger' : step === 2 ? 'success' : 'accent'}
        captions={[
          'Страница открылась: товаров ещё нет — рисуем скелетоны',
          <>
            Фронт отправляет запрос <M>GET /api/v1/items</M>
          </>,
          'Бэкенд отвечает JSON — только данные, без оформления',
          'Фронт превращает данные в карточки',
          'Ошибка на сервере → показываем её, а не пустую страницу',
        ]}
      />
    </SlideLayout>
  );
}
