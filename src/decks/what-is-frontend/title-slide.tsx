'use client';

import { motion } from 'framer-motion';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { LAYER_TONE, PRODUCTS } from './data';
import { BrowserWindow, Cursor, ProductTile, ShopHeader } from './ui';

/**
 * Один шаг. Окно браузера «собирается» из блоков: сначала пунктирные места,
 * потом в них въезжают шапка, заголовок и карточки; в конце курсор жмёт «В корзину».
 */

const T0 = 0.5; // когда появляется окно
const CLICK = 3.0; // когда курсор нажимает кнопку

/** Блок страницы: пунктирное место + содержимое, которое в него «вставляется». */
function Slot({ delay, from = 'up', className, children }: { delay: number; from?: 'up' | 'down' | 'left' | 'right' | 'scale'; className?: string; children: React.ReactNode }) {
  const off = { up: { y: 40 }, down: { y: -40 }, left: { x: 60 }, right: { x: -60 }, scale: { scale: 0.7 } }[from];
  return (
    <div className={cn('relative', className)}>
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-dashed border-border-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: delay - T0 + 0.6, times: [0, 0.2, 0.8, 1], delay: T0 + 0.2 }}
      />
      <motion.div
        className="h-full"
        initial={{ opacity: 0, ...off }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.55, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function TitleSlide(_: SlideProps) {
  const tiles = PRODUCTS.slice(0, 3);
  return (
    <div className="flex h-full items-center gap-16 px-24 pb-6">
      {/* Слева — название */}
      <div className="flex w-[600px] shrink-0 flex-col">
        <Reveal from="down">
          <div className="eyebrow text-accent">Основы веба</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-5 text-[96px] font-extrabold leading-[1.02] tracking-tight">
            Что такое
            <br />
            фронтенд
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-7 text-[34px] leading-snug text-text-2">
            всё, что пользователь
            <br />
            видит и нажимает
          </p>
        </Reveal>
        <div className="mt-12 flex flex-wrap gap-3">
          {(
            [
              ['HTML', LAYER_TONE.html],
              ['CSS', LAYER_TONE.css],
              ['JavaScript', LAYER_TONE.js],
              ['React', 'accent'],
            ] as const
          ).map(([name, tone], i) => (
            <Reveal key={name} from="up" delay={1.2 + i * 0.15}>
              <Chip tone={tone} className="text-[22px]">
                {name}
              </Chip>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Справа — окно, которое собирается из блоков */}
      <motion.div
        className="relative flex-1"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: T0 - 0.3, ease: EASE }}
      >
        <BrowserWindow url="shop.ru" style={{ height: 560 }} bodyClassName="flex flex-col gap-4 bg-bg p-5">
          <Slot delay={T0 + 0.6} from="down" className="shrink-0">
            <ShopHeader count={1} countFrom={0} cartDelay={CLICK + 0.1} />
          </Slot>
          <Slot delay={T0 + 1.0} from="right" className="h-9 w-56 shrink-0">
            <div className="text-[28px] font-bold leading-9">Каталог</div>
          </Slot>
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
            {tiles.map((p, i) => (
              <Slot key={p.id} delay={T0 + 1.3 + i * 0.2} from="scale">
                <ProductTile product={p} imageH={150} className="h-full" buttonActive={i === 1} />
              </Slot>
            ))}
          </div>
        </BrowserWindow>
        {/* Курсор подлетает к кнопке второй карточки */}
        <Cursor from={[640, 560]} to={[372, 492]} delay={CLICK - 0.9} />
      </motion.div>
    </div>
  );
}
