'use client';

import { motion } from 'framer-motion';
import { Database, Headphones, LoaderCircle, Server, Smartphone } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { ITEM, ITEM_2, rub } from './data';
import { BrowserWindow } from './parts';

/**
 * Шаги:
 * 0 — браузер собирает запрос GET /api/v1/items
 * 1 — запрос долетел до сервера
 * 2 — сервер достаёт товары из базы
 * 3 — ответ 200 + JSON, браузер рисует каталог
 */

const REQUEST = `GET /api/v1/items HTTP/1.1
Host: shop.ru
Accept: application/json`;

const RESPONSE = `{ "data": {
    "items": [
      { "title": "${ITEM.title}", "price": ${ITEM.price}, … },
      { "title": "${ITEM_2.title}", "price": ${ITEM_2.price}, … }
    ],
    "total": 2, …
}, … }`;

const MID_X = 440;
const MID_W = 600;
const SRV_X = 1100;

export function RequestSlide({ step }: SlideProps) {
  const loaded = step >= 3;

  return (
    <SlideLayout section="web" title="Запрос и ответ">
      {/* Браузер */}
      <BrowserWindow url="shop.ru/catalog" active={step === 0 || step === 3} className="absolute" style={{ left: 0, top: 0, width: 380, height: 520 }}>
        <div className="p-5">
          <div className="text-[28px] font-bold">Каталог</div>
          <Swap k={loaded ? 'loaded' : 'loading'} className="mt-4">
            {loaded ? (
              <div className="flex flex-col gap-4">
                <Product icon={Headphones} title={ITEM.title} price={rub(ITEM.price)} />
                <Product icon={Smartphone} title={ITEM_2.title} price={rub(ITEM_2.price)} />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Skeleton />
                <Skeleton />
                <div className="flex items-center gap-3 pt-2 text-[22px] text-muted">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="flex">
                    <LoaderCircle size={26} />
                  </motion.span>
                  загрузка…
                </div>
              </div>
            )}
          </Swap>
        </div>
      </BrowserWindow>

      {/* Запрос */}
      <Code code={REQUEST} lang="http" title="HTTP-запрос" size="sm" className="absolute" style={{ left: MID_X, top: 0, width: MID_W }} />
      <div className="absolute flex items-center gap-6 text-[22px] text-text-2" style={{ left: MID_X, top: 180, width: MID_W }}>
        <span className="flex items-center gap-2">
          <Chip tone="ctrl">GET</Chip> = «дай»
        </span>
        <span className="flex items-center gap-2">
          <Chip tone="ctrl">/api/v1/items</Chip> = «товары»
        </span>
      </div>

      {/* Сервер и база */}
      <NodeBox tone="logic" icon={Server} title="Сервер" sub={<span className="font-sans">бэкенд</span>} size="lg" state={step === 1 || step === 2 ? 'active' : step === 3 ? 'done' : 'idle'} className="absolute" style={{ left: SRV_X, top: 0, width: 340 }} />
      <NodeBox tone="db" icon={Database} title="База данных" sub="PostgreSQL" size="lg" state={step === 2 ? 'active' : step === 3 ? 'idle' : 'dim'} className="absolute" style={{ left: SRV_X, top: 300, width: 340 }} />

      {/* Ответ */}
      <Reveal show={loaded} from="left" className="absolute" style={{ left: MID_X, top: 250, width: MID_W }}>
        <div className="mb-3 flex items-center gap-3">
          <Chip tone="success" solid>
            200 OK
          </Chip>
          <span className="text-[22px] font-semibold text-text-2">ответ сервера — данные в JSON</span>
        </div>
        <Code code={RESPONSE} lang="json" size="sm" />
      </Reveal>

      {/* Стрелки: браузер → запрос → сервер → база → ответ → браузер */}
      <Arrow from={[384, 70]} to={[MID_X - 6, 70]} tone={step === 0 ? 'ctrl' : 'muted'} />
      <Arrow show={step >= 1} from={[MID_X + MID_W + 4, 56]} to={[SRV_X - 8, 56]} tone={step === 1 ? 'ctrl' : 'muted'} flow={step === 1} />
      <Arrow show={step >= 2} from={[SRV_X + 130, 118]} to={[SRV_X + 130, 294]} tone={step === 2 ? 'db' : 'muted'} flow={step === 2} />
      <Arrow show={step >= 2} from={[SRV_X + 210, 294]} to={[SRV_X + 210, 118]} tone={step === 2 ? 'db' : 'muted'} flow={step === 2} delay={0.4} />
      <Arrow show={loaded} from={[SRV_X - 6, 90]} to={[MID_X + MID_W + 6, 310]} curve={-40} tone="success" flow />
      <Arrow show={loaded} from={[MID_X - 6, 380]} to={[388, 380]} tone="success" flow delay={0.3} />

      <StepCaption
        step={step}
        tone="db"
        captions={[
          'Браузер собирает запрос: метод GET и адрес',
          'Запрос улетает на сервер по адресу /api/v1/items',
          'Сервер достаёт товары из базы',
          'Ответ: статус 200 и данные в JSON — браузер рисует каталог',
        ]}
      />
    </SlideLayout>
  );
}

function Skeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-border p-4">
      <div className="h-16 w-16 animate-pulse rounded-xl bg-surface-3" />
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-3" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
      </div>
    </div>
  );
}

function Product({ icon: Icon, title, price }: { icon: typeof Headphones; title: string; price: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-border p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-client/10 text-client">
        <Icon size={34} />
      </div>
      <div>
        <div className="text-[24px] font-semibold leading-tight">{title}</div>
        <div className="mt-1 text-[24px] font-bold">{price}</div>
      </div>
    </div>
  );
}
