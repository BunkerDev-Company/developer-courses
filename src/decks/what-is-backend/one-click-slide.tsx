'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check, CircleCheckBig, ClipboardList, Database, Headphones, LoaderCircle, Mail, MousePointerClick, PackageSearch, ShieldCheck, UserCheck } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { DataTable, type DataRow } from '@/components/ui/data-table';
import { Packet } from '@/components/ui/packet';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { ITEM, ORDER_NO, rub } from './data';
import { BrowserWindow, DoneBadge, Pill } from './parts';

/**
 * Шаги: 0 клик → POST, 1 токен, 2 наличие на складе, 3 создать заказ, 4 ответ 201, 5 «Заказ оформлен».
 * Пакет-конверт идёт сверху вниз по проверкам и возвращается в браузер.
 */

interface Gate {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  detail: React.ReactNode;
  result: React.ReactNode;
}

const CHECKS: Gate[] = [
  {
    tone: 'guard',
    icon: ShieldCheck,
    title: 'Кто ты?',
    detail: <span className="font-mono text-[19px]">Authorization: Bearer eyJ…</span>,
    result: <Pill tone="success" icon={UserCheck}>Вася</Pill>,
  },
  {
    tone: 'db',
    icon: PackageSearch,
    title: 'Есть на складе?',
    detail: <span className="text-[21px]">{ITEM.title}: нужно 1, есть 3</span>,
    result: <Pill tone="success" icon={Check}>есть</Pill>,
  },
  {
    tone: 'logic',
    icon: ClipboardList,
    title: 'Создаём заказ',
    detail: <span className="text-[21px]">сумма {rub(ITEM.price)} · со склада −1</span>,
    result: <Pill tone="success">№{ORDER_NO}</Pill>,
  },
];

const BROWSER_W = 290;
const FRAME = { left: 370, width: 710 };
const RAIL_X = 410;
const CP_X = 450;
const CP_W = 600;
const CP_H = 128;
const CP_TOP = [66, 216, 366];
const CP_MID = CP_TOP.map((t) => t + CP_H / 2);
const DB_X = 1120;
const GAP_X = (BROWSER_W + FRAME.left) / 2;

function packetAt(step: number): [number, number] {
  if (step === 0) return [GAP_X, CP_MID[0]];
  if (step <= 3) return [RAIL_X, CP_MID[step - 1]];
  if (step === 4) return [GAP_X, CP_MID[2]];
  return [140, CP_MID[2]];
}

export function OneClickSlide({ step }: SlideProps) {
  const response = step >= 4;
  const itemRows: DataRow[] = [
    { key: 'h', cells: [ITEM.title, step >= 3 ? 2 : 3], state: step === 2 ? 'hl' : step === 3 ? 'new' : 'normal' },
    { key: 'c', cells: ['Чехол', 12], state: 'dim' },
  ];
  const orderRows: DataRow[] = [{ key: '1041', cells: [1041, '990.00'], state: 'dim' }];
  if (step >= 3) orderRows.push({ key: '1042', cells: [ORDER_NO, `${ITEM.price}.00`], state: step === 3 ? 'new' : 'normal' });

  return (
    <SlideLayout section="web" title="Клик «Оформить заказ»: что внутри">
      {/* Браузер */}
      <BrowserWindow url="shop.ru/cart" active={step === 0 || step === 5} className="absolute" style={{ left: 0, top: 0, width: BROWSER_W, height: 540 }}>
        <Swap k={step === 5 ? 'ok' : 'cart'} className="h-full">
          {step === 5 ? (
            <div className="flex flex-col items-center px-5 pt-16 text-center">
              <CircleCheckBig size={76} className="text-success" />
              <div className="mt-5 text-[28px] font-bold leading-tight">Заказ №{ORDER_NO} оформлен!</div>
              <div className="mt-3 text-[22px] text-text-2">{rub(ITEM.price)}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-5">
              <div className="text-[26px] font-bold">Корзина</div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-border p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-client/10 text-client">
                  <Headphones size={26} />
                </div>
                <div>
                  <div className="text-[21px] font-semibold leading-tight">{ITEM.title}</div>
                  <div className="text-[21px] font-bold">{rub(ITEM.price)}</div>
                </div>
              </div>
              <div className="text-[21px] text-text-2">
                Итого: <b className="text-text">{rub(ITEM.price)}</b>
              </div>
              <div
                className={cn(
                  'relative mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[21px] font-semibold text-white transition-shadow duration-300',
                  step === 0 && 'shadow-[0_0_0_6px_rgb(var(--c-accent)/0.25)]',
                )}
              >
                {step === 0 ? (
                  'Оформить заказ'
                ) : (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="flex">
                      <LoaderCircle size={22} />
                    </motion.span>
                    Оформляем…
                  </>
                )}
                {step === 0 && <MousePointerClick size={32} className="absolute -bottom-5 right-6 text-text" />}
              </div>
            </div>
          )}
        </Swap>
      </BrowserWindow>

      {/* Бэкенд: три проверки сверху вниз */}
      <div className="absolute rounded-3xl border-2 border-dashed border-logic/40 bg-logic/[0.03]" style={{ left: FRAME.left, top: 0, width: FRAME.width, height: 540 }}>
        <span className="absolute left-6 top-3.5 text-[22px] font-bold text-logic">Бэкенд</span>
      </div>
      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
        <line x1={RAIL_X} y1={CP_MID[0]} x2={RAIL_X} y2={CP_MID[2]} className="stroke-border-2" strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
      </svg>

      {CHECKS.map((c, i) => {
        const current = step === i + 1;
        const passed = step > i + 1;
        const t = TONE[c.tone];
        return (
          <motion.div
            key={c.title}
            initial={false}
            animate={{ opacity: step >= i + 1 || step === 0 ? 1 : 0.4, scale: current ? 1.03 : 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              'absolute flex items-center gap-4 rounded-2xl border-2 bg-surface px-5 shadow-card transition-[border-color,box-shadow] duration-300',
              current ? cn(t.border, t.ring) : passed ? 'border-success/60' : 'border-border',
            )}
            style={{ left: CP_X, top: CP_TOP[i], width: CP_W, height: CP_H }}
          >
            <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
              <c.icon size={30} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[26px] font-bold leading-tight">{c.title}</div>
              <div className="mt-1 truncate text-text-2">{c.detail}</div>
            </div>
            <motion.div initial={false} animate={{ opacity: step >= i + 1 ? 1 : 0, scale: step >= i + 1 ? 1 : 0.7 }} transition={{ duration: 0.35, delay: current ? 0.5 : 0 }}>
              {c.result}
            </motion.div>
            {passed && <DoneBadge />}
          </motion.div>
        );
      })}

      {/* База */}
      <div className="absolute flex items-center gap-2.5 text-[22px] font-bold text-db" style={{ left: DB_X + 4, top: 0 }}>
        <Database size={26} /> PostgreSQL
      </div>
      <DataTable title='"Item"' columns={['title', 'stock']} grid="1fr 70px" rows={itemRows} size="sm" className="absolute" style={{ left: DB_X, top: 40, width: 320 }} />
      <DataTable title='"Order"' columns={['№', 'сумма']} grid="70px 1fr" rows={orderRows} size="sm" className="absolute" style={{ left: DB_X, top: 300, width: 320 }} />
      <Arrow show={step >= 2} from={[CP_X + CP_W + 6, CP_MID[1]]} to={[DB_X - 8, 150]} curve={-30} tone={step === 2 ? 'db' : 'muted'} flow={step === 2} />
      <Arrow show={step >= 3} from={[CP_X + CP_W + 6, CP_MID[2]]} to={[DB_X - 8, 449]} tone={step === 3 ? 'db' : 'muted'} flow={step === 3} />

      {/* Запрос туда, ответ обратно */}
      <Arrow from={[BROWSER_W + 4, CP_MID[0]]} to={[CP_X - 6, CP_MID[0]]} tone={step === 0 ? 'ctrl' : 'muted'} width={3} />
      <Arrow show={response} from={[CP_X - 6, CP_MID[2]]} to={[BROWSER_W + 6, CP_MID[2]]} tone={step === 4 ? 'success' : 'muted'} flow={step === 4} width={3} />

      <Packet at={packetAt(step)} show={step <= 4} tone={response ? 'success' : 'ctrl'} className="px-3 py-2">
        <span className="flex items-center gap-1.5">
          <Mail size={24} />
          {response && '201'}
        </span>
      </Packet>

      <StepCaption
        step={step}
        tone="db"
        captions={[
          'Клик → фронт отправляет POST /api/v1/orders',
          'Бэкенд проверяет токен: кто это?',
          'Проверяет в базе: товар есть на складе?',
          'Создаёт заказ и списывает товар со склада',
          'Отвечает 201 Created — заказ создан',
          'Фронт показывает: «Заказ оформлен!»',
        ]}
      />
    </SlideLayout>
  );
}
