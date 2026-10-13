'use client';

import { ChefHat, ConciergeBell, DoorClosed, DoorOpen, Eye, EyeOff, Package, ReceiptText, Refrigerator, Soup, UserRound } from 'lucide-react';
import { Packet } from '@/components/ui/packet';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Tile, Zone, type TileState } from './parts';

/**
 * Шаги:
 * 0 — ресторан: зал (гость, официант) и кухня (повар, склад)
 * 1 — гость заказывает, официант записывает чек
 * 2 — чек уезжает на кухню
 * 3 — повар берёт продукты со склада
 * 4 — блюдо возвращается к гостю
 */

const TILE_W = 250;
const TILE_TOP = 74;
const LANE_Y = 436;
// Центры станций по X.
const X = { guest: 175, waiter: 505, chef: 935, storage: 1265 } as const;
const DOOR_X = 720;
const PACKET = 'px-5 py-2.5 text-[22px]';

function states(step: number): Record<keyof typeof X, TileState> {
  switch (step) {
    case 1:
      return { guest: 'active', waiter: 'active', chef: 'dim', storage: 'dim' };
    case 2:
      return { guest: 'dim', waiter: 'active', chef: 'active', storage: 'dim' };
    case 3:
      return { guest: 'dim', waiter: 'dim', chef: 'active', storage: 'active' };
    case 4:
      return { guest: 'active', waiter: 'active', chef: 'done', storage: 'dim' };
    default:
      return { guest: 'idle', waiter: 'idle', chef: 'idle', storage: 'idle' };
  }
}

export function RestaurantSlide({ step }: SlideProps) {
  const s = states(step);
  const doorOpen = step === 2 || step === 4;
  const Door = doorOpen ? DoorOpen : DoorClosed;

  return (
    <SlideLayout section="intro" title="Бэкенд — это кухня ресторана">
      <Zone label="Зал — его видит гость" icon={Eye} tone="client" style={{ left: 0, top: 0, width: 680, height: 520 }} />
      <Zone label="Кухня — гостю не видна" icon={EyeOff} tone="logic" dashed style={{ left: 760, top: 0, width: 680, height: 520 }} />

      <Tile tone="client" icon={UserRound} title="Гость" sub="смотрит меню" state={s.guest} size="lg" className="absolute" style={{ left: X.guest - TILE_W / 2, top: TILE_TOP, width: TILE_W }} />
      <Tile tone="ctrl" icon={ConciergeBell} title="Официант" sub="носит заказы" state={s.waiter} size="lg" className="absolute" style={{ left: X.waiter - TILE_W / 2, top: TILE_TOP, width: TILE_W }} />
      <Tile tone="logic" icon={ChefHat} title="Повар" sub="готовит блюда" state={s.chef} size="lg" className="absolute" style={{ left: X.chef - TILE_W / 2, top: TILE_TOP, width: TILE_W }} />
      <Tile tone="db" icon={Refrigerator} title="Склад" sub="хранит продукты" state={s.storage} size="lg" className="absolute" style={{ left: X.storage - TILE_W / 2, top: TILE_TOP, width: TILE_W }} />

      {/* Дорожка, по которой ходят заказы и блюда */}
      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
        <line x1={X.guest} y1={LANE_Y} x2={X.storage} y2={LANE_Y} className="stroke-border-2" strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" />
        {Object.values(X).map((x) => (
          <circle key={x} cx={x} cy={LANE_Y} r={8} className="fill-border-2" />
        ))}
      </svg>

      {/* Дверь на кухню */}
      <div
        className={cn(
          'absolute flex h-16 w-16 items-center justify-center rounded-full border-2 bg-surface shadow-card transition-colors duration-300',
          doorOpen ? 'border-ctrl text-ctrl' : 'border-border-2 text-muted',
        )}
        style={{ left: DOOR_X - 32, top: LANE_Y - 32 }}
      >
        <Door size={30} />
      </div>

      {/* Гость говорит заказ */}
      <Reveal show={step === 1} from="scale" className="absolute" style={{ left: X.guest - 130, top: LANE_Y - 28, width: 260 }}>
        <div className="relative rounded-2xl border-2 border-client bg-surface px-4 py-2.5 text-center text-[22px] font-semibold shadow-lift">
          «Одну карбонару!»
          <span className="absolute -top-[11px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-client bg-surface" />
        </div>
      </Reveal>

      {/* Чек: у официанта → на кухню */}
      <Packet tone="ctrl" className={PACKET} show={step === 1 || step === 2} at={[step >= 2 ? X.chef : step === 1 ? X.waiter : X.guest, LANE_Y]}>
        <span className="flex items-center gap-2 font-sans">
          <ReceiptText size={24} /> Заказ: карбонара
        </span>
      </Packet>

      {/* Продукты: со склада → повару */}
      <Packet tone="db" className={PACKET} show={step === 3} at={[step >= 3 ? X.chef : X.storage, LANE_Y]}>
        <span className="flex items-center gap-2 font-sans">
          <Package size={24} /> паста, бекон, яйца
        </span>
      </Packet>

      {/* Блюдо: с кухни → гостю */}
      <Packet tone="success" className={PACKET} show={step === 4} at={[step >= 4 ? X.guest : X.chef, LANE_Y]}>
        <span className="flex items-center gap-2 font-sans">
          <Soup size={24} /> Карбонара
        </span>
      </Packet>

      <StepCaption
        step={step}
        captions={[
          'Ресторан: гость сидит в зале, кухню он не видит',
          'Гость делает заказ — официант записывает его',
          'Официант относит заказ на кухню',
          'Повар берёт продукты со склада и готовит',
          'Официант приносит блюдо — гость видел только зал',
        ]}
      />
    </SlideLayout>
  );
}
