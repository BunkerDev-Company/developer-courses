'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowDown, BatteryFull, Bluetooth, Network, Plug, Waypoints, Wifi } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги — по технологии на клик: 0 Wi-Fi, 1 Zigbee / Z-Wave, 2 Bluetooth LE, 3 Thread + Matter.
 * У каждой — путь до интернета, питание и примеры устройств.
 */

interface Radio {
  name: string;
  icon: LucideIcon;
  tone: Tone;
  path: string[];
  power: { icon: LucideIcon; text: string };
  note: string;
  examples: string;
}

const RADIOS: Radio[] = [
  {
    name: 'Wi-Fi',
    icon: Wifi,
    tone: 'db',
    path: ['Чайник', 'Роутер', 'Интернет'],
    power: { icon: Plug, text: 'от розетки: ест много' },
    note: 'сразу в интернет, без посредников',
    examples: 'чайник, розетка, камера, пылесос',
  },
  {
    name: 'Zigbee / Z-Wave',
    icon: Waypoints,
    tone: 'git',
    path: ['Датчик', 'Хаб (шлюз)', 'Роутер', 'Интернет'],
    power: { icon: BatteryFull, text: 'батарейка на годы' },
    note: 'сеть-паутина: соседи передают друг другу',
    examples: 'датчик двери, кнопка, лампа',
  },
  {
    name: 'Bluetooth LE',
    icon: Bluetooth,
    tone: 'ctrl',
    path: ['Термометр', 'Телефон или шлюз', 'Интернет'],
    power: { icon: BatteryFull, text: 'мало энергии' },
    note: 'близко: в пределах комнаты',
    examples: 'термометр, весы, замок',
  },
  {
    name: 'Thread + Matter',
    icon: Network,
    tone: 'success',
    path: ['Датчик', 'Бордер-роутер', 'Роутер', 'Интернет'],
    power: { icon: BatteryFull, text: 'батарейка на годы' },
    note: 'Matter — общий язык всех брендов',
    examples: 'бордер-роутер — в колонке или хабе',
  },
];

const GAP = 24;
const COL_W = (1440 - GAP * 3) / 4;

export function RadioSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="protocols" title="Как устройство выходит в сеть">
      {RADIOS.map((r, i) => {
        const t = TONE[r.tone];
        const current = step === i;
        return (
          <Reveal key={r.name} show={step >= i} from="up" className="absolute" style={{ left: i * (COL_W + GAP), top: 0, width: COL_W, height: 548 }}>
            <div className={cn('card flex h-full flex-col border-t-[6px] px-6 pb-5 pt-5 transition-shadow duration-300', t.border, current && t.ring)}>
              <div className="flex items-center gap-3">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                  <r.icon size={28} />
                </div>
                <span className="text-[27px] font-bold leading-tight">{r.name}</span>
              </div>

              <div className="mt-5 flex flex-col items-start gap-1">
                {r.path.map((p, j) => (
                  <div key={p} className="flex flex-col items-start">
                    {j > 0 && <ArrowDown size={22} className="ml-4 text-muted" />}
                    <span
                      className={cn(
                        'rounded-xl border-2 px-3 py-1 text-[21px] font-semibold',
                        j === 0 ? cn(t.soft, t.borderSoft, t.text) : 'border-border bg-surface-2 text-text-2',
                      )}
                    >
                      {p}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-2.5">
                <span className="flex items-center gap-2.5 text-[21px] font-semibold">
                  <r.power.icon size={22} className={cn('shrink-0', t.text)} /> {r.power.text}
                </span>
                <span className="text-[21px] leading-snug">{r.note}</span>
                <span className="text-[19px] leading-snug text-text-2">{r.examples}</span>
              </div>
            </div>
          </Reveal>
        );
      })}

      <StepCaption
        step={step}
        tone={RADIOS[Math.min(step, 3)].tone}
        captions={[
          'Wi-Fi: чайник сам идёт через роутер в интернет',
          'Zigbee и Z-Wave экономят батарейку — но в интернет им нужен хаб',
          'Bluetooth — совсем рядом: через телефон или шлюз',
          'Thread — сеть-паутина с IP, Matter — общий язык для разных брендов',
        ]}
      />
    </SlideLayout>
  );
}
