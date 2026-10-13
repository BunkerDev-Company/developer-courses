'use client';

import { motion } from 'framer-motion';
import { Lock, MousePointer2, ShoppingCart, Store } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { money, type Product } from './data';

/* ─── Окно браузера ──────────────────────────────────────────────────────── */

/** Высота верхней панели окна (точки + адрес) — нужна для абсолютных координат внутри. */
export const BROWSER_BAR = 52;

interface BrowserWindowProps {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  /** Класс области страницы (под адресной строкой). */
  bodyClassName?: string;
  children?: React.ReactNode;
}

export function BrowserWindow({ url, className, style, bodyClassName, children }: BrowserWindowProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-lift', className)} style={style}>
      <div
        className="flex shrink-0 items-center gap-4 border-b-2 border-border bg-surface-2 px-4"
        style={{ height: BROWSER_BAR - 2 }}
      >
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-border-2" />
          <span className="h-3 w-3 rounded-full bg-border-2" />
          <span className="h-3 w-3 rounded-full bg-border-2" />
        </span>
        <div className="flex h-8 flex-1 items-center gap-2 rounded-lg bg-surface px-3 font-mono text-[16px] text-text-2">
          <Lock size={14} className="text-muted" />
          {url}
        </div>
      </div>
      <div className={cn('relative min-h-0 flex-1', bodyClassName)}>{children}</div>
    </div>
  );
}

/* ─── Корзина с бейджем ──────────────────────────────────────────────────── */

interface CartProps {
  count: number;
  /** Было до смены: показывается до `delay`, потом бейдж «прыгает» в `count`. */
  from?: number;
  /** Подсветить кольцом (бейдж только что изменился). */
  active?: boolean;
  /** Задержка смены числа. */
  delay?: number;
  size?: 'sm' | 'md';
}

export function Cart({ count, from, active, delay = 0, size = 'md' }: CartProps) {
  const sm = size === 'sm';
  const badge = (n: number) =>
    cn(
      'absolute -right-2.5 -top-2.5 flex items-center justify-center rounded-full font-bold text-white',
      sm ? 'h-6 min-w-6 px-1.5 text-[15px]' : 'h-7 min-w-7 px-2 text-[17px]',
      n > 0 ? 'bg-danger' : 'bg-muted',
    );
  const changes = from !== undefined && from !== count;
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-xl border-2 transition-[border-color,box-shadow] duration-300',
        sm ? 'h-10 w-10' : 'h-12 w-12',
        active ? cn(TONE.accent.border, TONE.accent.ring) : 'border-border',
      )}
    >
      <ShoppingCart size={sm ? 20 : 24} className="text-text-2" />
      {changes && (
        <motion.span
          key={`from-${from}`}
          className={badge(from)}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.05, delay }}
        >
          {from}
        </motion.span>
      )}
      <motion.span
        key={count}
        className={badge(count)}
        initial={changes ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 12, delay, opacity: { duration: 0.05, delay } }}
      >
        {count}
      </motion.span>
    </div>
  );
}

/* ─── Шапка магазина ─────────────────────────────────────────────────────── */

interface ShopHeaderProps {
  count: number;
  /** Число в бейдже до смены (см. Cart.from). */
  countFrom?: number;
  cartActive?: boolean;
  cartDelay?: number;
  search?: boolean;
  className?: string;
}

export function ShopHeader({ count, countFrom, cartActive, cartDelay, search = true, className }: ShopHeaderProps) {
  return (
    <div className={cn('flex items-center gap-4 rounded-xl border-2 border-border bg-surface px-4 py-2.5', className)}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
          <Store size={20} />
        </div>
        <span className="whitespace-nowrap text-[20px] font-bold">Etalon Shop</span>
      </div>
      {search ? <div className="h-9 flex-1 rounded-lg bg-surface-2" /> : <div className="flex-1" />}
      <Cart count={count} from={countFrom} active={cartActive} delay={cartDelay} size="sm" />
    </div>
  );
}

/* ─── Карточка товара ────────────────────────────────────────────────────── */

interface ProductTileProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
  /** Высота картинки. */
  imageH?: number;
  /** Подсветить данные (название и цену) — «пришли из пропсов / из JSON». */
  dataHl?: boolean;
  /** Подсветить кнопку (на неё сейчас нажмут). */
  buttonActive?: boolean;
  textSize?: number;
}

export function ProductTile({ product, className, style, imageH = 110, dataHl, buttonActive, textSize = 22 }: ProductTileProps) {
  const t = TONE[product.tone];
  const Icon = product.icon;
  const hl = dataHl ? 'rounded-md bg-accent/15 px-1 -mx-1 text-accent' : '';
  return (
    <div className={cn('flex flex-col gap-2.5 rounded-2xl border-2 border-border bg-surface p-3.5 shadow-card', className)} style={style}>
      <div className={cn('flex items-center justify-center rounded-xl', t.soft, t.text)} style={{ height: imageH }}>
        <Icon size={Math.round(imageH * 0.48)} strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-0.5" style={{ fontSize: textSize }}>
        <span className={cn('self-start truncate font-semibold leading-tight transition-colors duration-300', hl)}>{product.title}</span>
        <span className={cn('self-start font-bold leading-tight transition-colors duration-300', hl)}>{money(product.price)}</span>
      </div>
      <div
        className={cn(
          'mt-auto flex h-10 items-center justify-center rounded-xl bg-accent text-[17px] font-semibold text-white transition-shadow duration-300',
          buttonActive && TONE.accent.ring,
        )}
      >
        В корзину
      </div>
    </div>
  );
}

/* ─── Курсор мыши с кликом ───────────────────────────────────────────────── */

interface CursorProps {
  from: readonly [number, number];
  /** Куда указывает кончик стрелки. */
  to: readonly [number, number];
  delay?: number;
  /** Нарисовать «клик» (расходящийся круг) по прибытии. */
  click?: boolean;
}

/** Курсор, который подлетает к точке и кликает. Монтируется на нужном шаге — анимация проигрывается заново. */
export function Cursor({ from, to, delay = 0.2, click = true }: CursorProps) {
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-30"
      initial={{ x: from[0], y: from[1], opacity: 0 }}
      animate={{ x: to[0], y: to[1], opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: EASE, opacity: { duration: 0.2, delay } }}
    >
      {click && (
        <motion.span
          className="absolute -left-6 -top-6 h-12 w-12 rounded-full border-4 border-accent"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0.2, 1.5], opacity: [0.9, 0] }}
          transition={{ duration: 0.6, delay: delay + 0.85 }}
        />
      )}
      <MousePointer2 size={40} strokeWidth={1.5} className="-ml-[5px] -mt-[5px] fill-text text-surface drop-shadow" />
    </motion.div>
  );
}

/* ─── Миниатюра магазина без текста (для экранов устройств) ─────────────── */

interface MiniShopProps {
  products: Product[];
  cols: number;
  count?: number;
  cartActive?: boolean;
  /** Подсветить кнопку товара с этим индексом. */
  pressed?: number;
  className?: string;
}

export function MiniShop({ products, cols, count = 0, cartActive, pressed, className }: MiniShopProps) {
  return (
    <div className={cn('flex h-full flex-col gap-2 bg-bg p-2', className)}>
      <div className="flex shrink-0 items-center justify-between rounded-md bg-surface px-2 py-1.5">
        <span className="h-4 w-4 rounded bg-accent" />
        <span className="h-2.5 flex-1 mx-2 rounded-full bg-surface-3" />
        <span
          className={cn(
            'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[13px] font-bold leading-none text-white transition-[box-shadow] duration-300',
            count > 0 ? 'bg-danger' : 'bg-muted',
            cartActive && TONE.danger.ring,
          )}
        >
          {count}
        </span>
      </div>
      <div className="grid min-h-0 flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {products.map((p, i) => {
          const t = TONE[p.tone];
          const Icon = p.icon;
          return (
            <div key={p.id} className="flex min-h-0 flex-col gap-1.5 rounded-md bg-surface p-1.5">
              <div className={cn('flex min-h-0 flex-1 items-center justify-center rounded', t.soft, t.text)}>
                <Icon size={26} strokeWidth={1.75} />
              </div>
              <span className="h-2 w-3/4 shrink-0 rounded-full bg-surface-3" />
              <span className="h-2 w-1/2 shrink-0 rounded-full bg-border-2" />
              <span
                className={cn(
                  'h-3.5 shrink-0 rounded bg-accent transition-[box-shadow] duration-300',
                  pressed === i && TONE.accent.ring,
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
