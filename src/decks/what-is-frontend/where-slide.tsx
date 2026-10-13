'use client';

import { motion } from 'framer-motion';
import { Cog, FileCode2, Laptop, Server, Smartphone, Tablet } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Packet } from '@/components/ui/packet';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { LAYER_TONE, PRODUCTS } from './data';
import { Cursor, MiniShop } from './ui';

/**
 * Шаги:
 * 0 — код фронтенда лежит на сервере: три файла
 * 1 — браузеры скачивают файлы (пакеты летят на ноутбук, планшет, телефон)
 * 2 — каждый браузер сам запускает код → на экранах магазин
 * 3 — клик на телефоне: корзина 1 только у него — у каждого своя копия
 */

const FILES: { name: string; tone: Tone }[] = [
  { name: 'index.html', tone: LAYER_TONE.html },
  { name: 'styles.css', tone: LAYER_TONE.css },
  { name: 'app.js', tone: LAYER_TONE.js },
];

type DeviceKind = 'laptop' | 'tablet' | 'phone';

interface DeviceDef {
  kind: DeviceKind;
  label: string;
  icon: typeof Laptop;
  /** Экран: левый верхний угол и размер (в координатах слайда). */
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  n: number;
}

const DEVICES: DeviceDef[] = [
  { kind: 'laptop', label: 'Chrome', icon: Laptop, x: 470, y: 120, w: 420, h: 250, cols: 3, n: 3 },
  { kind: 'tablet', label: 'Safari', icon: Tablet, x: 980, y: 90, w: 210, h: 290, cols: 2, n: 4 },
  { kind: 'phone', label: 'Яндекс Браузер', icon: Smartphone, x: 1280, y: 100, w: 150, h: 280, cols: 1, n: 2 },
];

const SERVER = { left: 0, top: 90, width: 340 };
const SERVER_OUT: [number, number] = [344, 160];

function center(d: DeviceDef): [number, number] {
  return [d.x + d.w / 2, d.y + d.h / 2];
}

function Device({ d, step }: { d: DeviceDef; step: number }) {
  const phone = d.kind === 'phone';
  const running = step >= 2;
  const tapped = step === 3 && phone;
  const bezel = d.kind === 'laptop' ? 10 : phone ? 8 : 10;
  const radius = d.kind === 'laptop' ? 'rounded-t-2xl' : phone ? 'rounded-[28px]' : 'rounded-[24px]';
  const inner = d.kind === 'laptop' ? 'rounded-t-md' : phone ? 'rounded-[20px]' : 'rounded-[14px]';

  return (
    <>
      <motion.div
        className={cn('absolute bg-code-bg shadow-lift ring-2 ring-border-2 transition-shadow duration-300', radius, tapped && TONE.accent.ring)}
        style={{ left: d.x - bezel, top: d.y - bezel, width: d.w + bezel * 2, height: d.h + bezel * 2 }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      />
      {/* Экран */}
      <motion.div
        className={cn('absolute overflow-hidden bg-surface-2', inner)}
        style={{ left: d.x, top: d.y, width: d.w, height: d.h }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <motion.div
          className="h-full"
          initial={false}
          animate={{ opacity: running ? 1 : 0 }}
          transition={{ duration: 0.5, delay: running ? 0.15 : 0, ease: EASE }}
        >
          <MiniShop
            products={PRODUCTS.slice(0, d.n)}
            cols={d.cols}
            count={tapped ? 1 : 0}
            cartActive={tapped}
            pressed={tapped ? 0 : undefined}
            className={phone ? 'pt-4' : undefined}
          />
        </motion.div>
        {!running && (
          <div className="absolute inset-0 flex items-center justify-center text-[18px] font-medium text-muted">пусто</div>
        )}
      </motion.div>
      {d.kind === 'laptop' && (
        <div
          className="absolute rounded-b-xl bg-border-2"
          style={{ left: d.x - 40, top: d.y + d.h + bezel, width: d.w + 80, height: 14 }}
        />
      )}
      {/* «Код работает» — шестерёнка на углу экрана */}
      <Reveal
        show={running}
        from="scale"
        delay={0.3}
        className="absolute"
        style={{ left: d.x + d.w - 22, top: d.y - 26 }}
      >
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-full border-2 bg-surface shadow-card', TONE.warning.border)}>
          <motion.span
            className="flex text-warning"
            animate={running ? { rotate: 360 } : { rotate: 0 }}
            transition={running ? { duration: 3, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          >
            <Cog size={28} />
          </motion.span>
        </div>
      </Reveal>
      {/* Подпись устройства */}
      <div
        className="absolute flex flex-col items-center gap-2"
        style={{ left: d.x + d.w / 2 - 120, top: 404, width: 240 }}
      >
        <div className="flex items-center gap-2 whitespace-nowrap text-[20px] font-semibold text-text-2">
          <d.icon size={22} /> {d.label}
        </div>
      </div>
    </>
  );
}

export function WhereSlide({ step }: SlideProps) {
  const sending = step === 1;

  return (
    <SlideLayout section="web" title="Где живёт фронтенд">
      {/* Сервер с файлами */}
      <motion.div
        className={cn(
          'card absolute p-5 transition-[border-color,box-shadow] duration-300',
          sending && cn(TONE.logic.border, TONE.logic.ring),
        )}
        style={SERVER}
        initial={false}
        animate={{ opacity: step >= 2 ? 0.45 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div className="flex items-center gap-4">
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', TONE.logic.soft, TONE.logic.text)}>
            <Server size={30} />
          </div>
          <div>
            <div className="text-[24px] font-semibold leading-tight">Сервер сайта</div>
            <div className="mt-1 font-mono text-[17px] text-text-2">shop.ru</div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          {FILES.map((f) => (
            <div
              key={f.name}
              className={cn('flex items-center gap-3 rounded-xl border-2 px-3 py-2 font-mono text-[20px]', TONE[f.tone].borderSoft, TONE[f.tone].soft)}
            >
              <FileCode2 size={22} className={TONE[f.tone].text} />
              {f.name}
            </div>
          ))}
        </div>
        <div className="mt-4 text-[17px] text-text-2">просто файлы с кодом</div>
      </motion.div>

      {/* Стрелки: сервер → браузеры */}
      <Arrow show={step >= 1} from={SERVER_OUT} to={[DEVICES[0].x - 14, 190]} tone={sending ? 'logic' : 'muted'} flow={sending} curve={-10} />
      <Arrow show={step >= 1} from={SERVER_OUT} to={[DEVICES[1].x + 40, DEVICES[1].y - 22]} tone={sending ? 'logic' : 'muted'} flow={sending} curve={-110} delay={0.15} />
      <Arrow show={step >= 1} from={SERVER_OUT} to={[DEVICES[2].x + 40, DEVICES[2].y - 20]} tone={sending ? 'logic' : 'muted'} flow={sending} curve={-150} delay={0.3} />
      <Reveal show={step >= 1} className="absolute" style={{ left: 590, top: -6 }}>
        <Chip tone="logic" className="font-sans text-[20px]">браузер скачивает файлы</Chip>
      </Reveal>

      {DEVICES.map((d) => (
        <Device key={d.kind} d={d} step={step} />
      ))}

      {/* Файлы летят на каждое устройство */}
      {DEVICES.map((d) => (
        <Packet key={d.kind} at={step >= 1 ? center(d) : [170, 300]} show={sending} tone="logic" className="flex gap-1.5 px-3">
          {FILES.map((f) => (
            <FileCode2 key={f.name} size={24} className={TONE[f.tone].text} />
          ))}
        </Packet>
      ))}

      {/* Шаг 3: клик на телефоне */}
      <Reveal
        show={step === 3}
        from="scale"
        className="absolute rounded-[38px] border-4 border-accent"
        style={{ left: DEVICES[2].x - 18, top: DEVICES[2].y - 18, width: DEVICES[2].w + 36, height: DEVICES[2].h + 36 }}
      >
        <span />
      </Reveal>
      {step === 3 && <Cursor from={[1520, 420]} to={[1384, 244]} delay={0.1} />}
      <Reveal show={step === 3} from="up" delay={0.6} className="absolute" style={{ left: DEVICES[2].x - 10, top: 446 }}>
        <Chip tone="danger" className="font-sans text-[18px]">корзина: 1</Chip>
      </Reveal>
      <Reveal show={step === 3} from="up" delay={0.6} className="absolute" style={{ left: DEVICES[0].x + DEVICES[0].w / 2 - 60, top: 446 }}>
        <Chip tone="muted" className="font-sans text-[18px]">корзина: 0</Chip>
      </Reveal>
      <Reveal show={step === 3} from="up" delay={0.6} className="absolute" style={{ left: DEVICES[1].x + DEVICES[1].w / 2 - 60, top: 446 }}>
        <Chip tone="muted" className="font-sans text-[18px]">корзина: 0</Chip>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 1 ? 'logic' : step === 2 ? 'warning' : 'accent'}
        captions={[
          'Код фронтенда — это файлы. Они лежат на сервере',
          'Браузер открывает сайт и скачивает эти файлы',
          'Дальше каждый браузер сам запускает код у себя',
          'Клик обработал сам телефон: у каждого своя копия',
        ]}
      />
    </SlideLayout>
  );
}
