'use client';

import { Headphones, MousePointerClick, Server, ShieldCheck, VenetianMask } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { DataTable } from '@/components/ui/data-table';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { ITEM, ORDER_NO, rub } from './data';
import { BrowserWindow, Pill } from './parts';

/**
 * Шаги:
 * 0 — корзина: наушники за 1990
 * 1 — «хитрый пользователь» в DevTools меняет цену на 1
 * 2 — фронт отправляет заказ с price: 1
 * 3 — бэкенд берёт цену из базы → 1990
 */

const STORAGE = `cart = [{
  "title": "${ITEM.title}",
  "price": 1,  // было ${ITEM.price}
  "qty": 1
}]`;

const REQUEST = `POST /api/v1/orders

{
  "itemId": "${ITEM.id}",
  "qty": 1,
  "price": 1
}`;

const BROWSER_W = 560;
const REQ_X = 600;
const REQ_W = 340;
const SRV_X = 980;
const SRV_W = 460;

export function TrustSlide({ step }: SlideProps) {
  const hacked = step >= 1;
  const price = hacked ? 1 : ITEM.price;

  return (
    <SlideLayout section="backend" title="Почему фронтенду нельзя доверять">
      {/* Браузер — чужая территория */}
      <BrowserWindow url="shop.ru/cart" active={step <= 2} tone={hacked ? 'danger' : 'client'} className="absolute" style={{ left: 0, top: 0, width: BROWSER_W, height: 540 }}>
        <div className="flex h-full flex-col">
          <div className="p-5 pb-0">
            <div className="text-[28px] font-bold">Корзина</div>
            <div className="mt-3 flex items-center gap-4 rounded-2xl border-2 border-border p-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-client/10 text-client">
                <Headphones size={30} />
              </div>
              <div className="flex-1">
                <div className="text-[24px] font-semibold leading-tight">{ITEM.title}</div>
                <div className="text-[19px] text-text-2">1 шт.</div>
              </div>
              <Swap k={price}>
                <span className={cn('text-[28px] font-bold', hacked && 'text-danger')}>{rub(price)}</span>
              </Swap>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span
                className={cn(
                  'relative rounded-xl bg-accent px-5 py-2.5 text-[22px] font-semibold text-white transition-shadow duration-300',
                  step === 2 && 'shadow-[0_0_0_6px_rgb(var(--c-accent)/0.25)]',
                )}
              >
                Оформить заказ
                {step === 2 && <MousePointerClick size={30} className="absolute -bottom-4 -right-4 text-text" />}
              </span>
              <span className="flex items-baseline gap-2 text-[22px] text-text-2">
                Итого:
                <Swap k={price}>
                  <b className={cn('text-[26px]', hacked ? 'text-danger' : 'text-text')}>{rub(price)}</b>
                </Swap>
              </span>
            </div>
          </div>

          {/* DevTools — пользователь может поменять что угодно */}
          <Reveal show={hacked} from="up" className="mt-auto">
            <div className="bg-code-bg">
              <div className="flex items-center justify-between border-b border-code-line/10 px-5 py-2.5">
                <span className="font-mono text-[16px] text-code-text/70">DevTools · Local Storage</span>
                <span className="flex items-center gap-2 text-[17px] font-semibold text-code-prop">
                  <VenetianMask size={20} /> хитрый пользователь
                </span>
              </div>
              <Code code={STORAGE} lang="json" size="sm" hl={[3]} tone="danger" className="rounded-none shadow-none ring-0" />
            </div>
          </Reveal>
        </div>
      </BrowserWindow>

      {/* Запрос с подменённой ценой */}
      <Reveal show={step >= 2} from="left" className="absolute" style={{ left: REQ_X, top: 70, width: REQ_W }}>
        <Code code={REQUEST} lang="http" size="sm" title="запрос" hl={[1, 6]} tone="danger" />
      </Reveal>
      <Arrow show={step >= 2} from={[BROWSER_W + 4, 160]} to={[REQ_X - 6, 160]} tone={step === 2 ? 'ctrl' : 'muted'} flow={step === 2} />
      <Arrow show={step >= 2} from={[REQ_X + REQ_W + 4, 160]} to={[SRV_X - 6, 160]} tone={step === 2 ? 'ctrl' : 'muted'} flow={step === 2} delay={0.3} />

      {/* Сервер */}
      <NodeBox
        tone="logic"
        icon={Server}
        title="Сервер"
        sub={<span className="font-sans">бэкенд</span>}
        size="lg"
        state={step === 2 ? 'active' : step === 3 ? 'done' : 'idle'}
        className="absolute"
        style={{ left: SRV_X, top: 0, width: SRV_W }}
      />

      {/* Что сервер сделал с ценой из запроса */}
      <Reveal show={step >= 2} className="absolute flex items-center gap-3" style={{ left: SRV_X, top: 136, width: SRV_W }}>
        <span className="text-[22px] text-text-2">из запроса:</span>
        <span className={cn('chip border-danger/30 bg-danger/10 text-danger transition-opacity duration-300', step === 3 && 'line-through decoration-[3px] opacity-60')}>
          &quot;price&quot;: 1
        </span>
        <Reveal show={step === 3} from="scale" delay={0.2}>
          <Pill tone="danger">не верим</Pill>
        </Reveal>
      </Reveal>

      {/* Цена из базы */}
      <Reveal show={step >= 3} from="up" delay={0.3} className="absolute" style={{ left: SRV_X, top: 198, width: SRV_W }}>
        <DataTable
          title='"Item" — база'
          columns={['title', 'price']}
          grid="1fr 150px"
          rows={[{ key: 'item', cells: [ITEM.title, `${ITEM.price}.00`], state: 'hl' }]}
          size="sm"
        />
      </Reveal>
      <Reveal show={step >= 3} from="up" delay={0.6} className="absolute flex items-center gap-3" style={{ left: SRV_X, top: 350, width: SRV_W }}>
        <span className="font-mono text-[22px] text-text-2">{ITEM.price} × 1 =</span>
        <Pill tone="success" solid>
          Заказ №{ORDER_NO}: {rub(ITEM.price)}
        </Pill>
      </Reveal>

      {/* Вывод */}
      <Reveal show={step >= 3} from="up" delay={0.9} className="absolute" style={{ left: SRV_X, top: 432, width: SRV_W }}>
        <div className="flex items-center gap-4 rounded-2xl border-2 border-guard bg-guard/10 px-5 py-3.5">
          <ShieldCheck size={40} className="shrink-0 text-guard" />
          <span className="text-[22px] font-semibold leading-snug">Браузер — чужая территория. Важное проверяет сервер</span>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={hacked && step < 3 ? 'danger' : 'logic'}
        captions={[
          `Корзина в браузере: наушники за ${rub(ITEM.price)}`,
          'Хитрый пользователь открыл DevTools и поменял цену на 1 ₽',
          'Фронт отправляет заказ — с ценой 1 ₽',
          'Бэкенд берёт цену из базы, а не из запроса',
        ]}
      />
    </SlideLayout>
  );
}
