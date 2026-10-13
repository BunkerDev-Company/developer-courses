'use client';

import { motion } from 'framer-motion';
import { Database, Eye, EyeOff, Server } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { money, PRODUCTS } from './data';
import { BrowserWindow, ShopHeader } from './ui';

/**
 * Шаги:
 * 0 — над водой витрина магазина, под водой что-то есть (приглушено)
 * 1 — подсвечен верх: это фронтенд
 * 2 — подсвечен низ: сервер и база — бэкенд
 */

const WATER_Y = 300;
const BROWSER = { left: 330, top: WATER_Y - 266, width: 640, height: 266 };

// Подводная часть айсберга: сверху ровно по ширине окна, книзу расширяется.
const ICE = [
  [340, WATER_Y + 6],
  [960, WATER_Y + 6],
  [1015, 338],
  [1062, 384],
  [1080, 434],
  [1046, 482],
  [994, 522],
  [890, 548],
  [770, 538],
  [650, 551],
  [510, 540],
  [390, 528],
  [296, 490],
  [252, 440],
  [270, 388],
  [304, 344],
]
  .map((p) => p.join(','))
  .join(' ');

/** Компактная карточка товара для маленького окна. */
function MiniTile({ i }: { i: number }) {
  const p = PRODUCTS[i];
  const t = TONE[p.tone];
  const Icon = p.icon;
  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-border bg-surface p-2.5">
      <div className="flex items-center gap-2.5">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', t.soft, t.text)}>
          <Icon size={26} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 text-[17px] leading-tight">
          <div className="truncate font-semibold">{p.title}</div>
          <div className="font-bold">{money(p.price)}</div>
        </div>
      </div>
      <div className="flex h-8 items-center justify-center rounded-lg bg-accent text-[15px] font-semibold text-white">В корзину</div>
    </div>
  );
}

export function IcebergSlide({ step }: SlideProps) {
  const front = step === 1;
  const back = step === 2;

  return (
    <SlideLayout section="intro" title="Приложение = видимое + скрытое">
      {/* Вода */}
      <div
        className="absolute inset-x-0 rounded-b-3xl bg-db/10"
        style={{ top: WATER_Y, height: 555 - WATER_Y }}
      />
      <svg className="pointer-events-none absolute left-0 overflow-visible" style={{ top: WATER_Y - 8 }} width="1440" height="16">
        <path
          d={`M 0 8 ${Array.from({ length: 36 }, (_, i) => `q 10 ${i % 2 ? 8 : -8} 20 0 q 10 ${i % 2 ? -8 : 8} 20 0`).join(' ')}`}
          className="fill-none stroke-db"
          strokeWidth={3}
          strokeOpacity={0.55}
        />
      </svg>

      {/* Подводная часть айсберга */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: back ? 1 : 0.35 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
          <polygon
            points={ICE}
            className={cn('fill-surface transition-[stroke] duration-300', back ? 'stroke-logic' : 'stroke-border-2')}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </svg>
        <NodeBox
          tone="logic"
          icon={Server}
          title="Сервер"
          sub="NestJS"
          state={back ? 'active' : 'idle'}
          className="absolute"
          style={{ left: 350, top: 330, width: 280 }}
        />
        <NodeBox
          tone="db"
          icon={Database}
          title="База данных"
          sub="PostgreSQL"
          state={back ? 'active' : 'idle'}
          className="absolute"
          style={{ left: 660, top: 330, width: 290 }}
        />
        <div className="absolute flex justify-center gap-3" style={{ left: 300, top: 452, width: 700 }}>
          {['товары', 'заказы', 'пароли', 'права'].map((x) => (
            <Chip key={x} tone="logic" className="font-sans text-[20px]">
              {x}
            </Chip>
          ))}
        </div>
      </motion.div>

      {/* Видимая часть — витрина магазина */}
      <motion.div
        className="absolute"
        style={BROWSER}
        initial={false}
        animate={{ opacity: back ? 0.45 : 1, scale: front ? 1.03 : 1 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <BrowserWindow
          url="shop.ru"
          className={cn('h-full transition-[border-color,box-shadow] duration-300', front && cn(TONE.accent.border, TONE.accent.ring))}
          bodyClassName="flex flex-col gap-2.5 bg-bg p-3"
        >
          <ShopHeader count={0} />
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <MiniTile key={i} i={i} />
            ))}
          </div>
        </BrowserWindow>
      </motion.div>

      {/* Слева: что видно, что нет */}
      <div className="absolute flex items-center gap-2 text-[20px] font-semibold text-text-2" style={{ left: 16, top: WATER_Y - 46 }}>
        <Eye size={24} /> видно
      </div>
      <div className="absolute flex items-center gap-2 text-[20px] font-semibold text-db" style={{ left: 16, top: WATER_Y + 18 }}>
        <EyeOff size={24} /> не видно
      </div>

      {/* Справа: подписи частей */}
      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: 1050, top: 90, width: 390 }}>
        <div className={cn('border-l-[6px] pl-6', TONE.accent.border)}>
          <div className="text-[40px] font-bold leading-tight text-accent">Фронтенд</div>
          <div className="mt-2 text-[24px] leading-snug text-text-2">то, что видит и нажимает пользователь</div>
        </div>
      </Reveal>
      <Reveal show={step >= 2} from="left" className="absolute" style={{ left: 1100, top: 340, width: 340 }}>
        <div className={cn('border-l-[6px] pl-6', TONE.logic.border)}>
          <div className="text-[40px] font-bold leading-tight text-logic">Бэкенд</div>
          <div className="mt-2 text-[24px] leading-snug text-text-2">работает на сервере, его не видно</div>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={back ? 'logic' : 'accent'}
        captions={[
          'Пользователь видит только то, что над водой',
          'Фронтенд — экран, кнопки, карточки, корзина',
          'Бэкенд — под водой: хранит данные и следит за правилами',
        ]}
      />
    </SlideLayout>
  );
}
