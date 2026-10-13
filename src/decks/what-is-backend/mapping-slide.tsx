'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeftRight, ChefHat, ConciergeBell, Database, Globe, Refrigerator, Server, UserRound, UtensilsCrossed } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги: по шагу соединяется пара «ресторан ↔ веб».
 * 0 — гость ↔ браузер, 1 — официант ↔ HTTP, 2 — кухня ↔ сервер, 3 — склад ↔ база (+ «бэкенд» = сервер и база).
 */

interface Pair {
  tone: Tone;
  top: { icon: LucideIcon; title: string; sub: string };
  /** mono — подпись-код (Node.js, PostgreSQL), иначе обычным шрифтом. */
  bottom: { icon: LucideIcon; title: string; sub: string; mono?: boolean };
  /** Что общего у пары. */
  common: string;
}

const PAIRS: Pair[] = [
  {
    tone: 'client',
    top: { icon: UserRound, title: 'Гость', sub: 'в зале' },
    bottom: { icon: Globe, title: 'Браузер', sub: 'сайт магазина' },
    common: 'то, что видит человек',
  },
  {
    tone: 'ctrl',
    top: { icon: ConciergeBell, title: 'Официант', sub: 'носит заказы' },
    bottom: { icon: ArrowLeftRight, title: 'HTTP', sub: 'запрос → ответ' },
    common: 'носит туда и обратно',
  },
  {
    tone: 'logic',
    top: { icon: ChefHat, title: 'Кухня', sub: 'повар готовит' },
    bottom: { icon: Server, title: 'Сервер', sub: 'Node.js + NestJS', mono: true },
    common: 'готовит по правилам',
  },
  {
    tone: 'db',
    top: { icon: Refrigerator, title: 'Склад', sub: 'продукты' },
    bottom: { icon: Database, title: 'База данных', sub: 'PostgreSQL', mono: true },
    common: 'хранит запасы',
  },
];

// Раскладка: слева колонка подписей рядов, дальше 4 колонки.
const COL_W = 290;
const GAP = 40;
const COL_X = (i: number) => 140 + i * (COL_W + GAP);
const TOP_Y = 20;
const BOTTOM_Y = 330;
const BOX_H = 96;
const BRACE_Y = 450;

function RowLabel({ icon: Icon, text, top }: { icon: LucideIcon; text: string; top: number }) {
  return (
    <div className="absolute flex flex-col items-center gap-1.5 text-center text-muted" style={{ left: 0, top, width: 110 }}>
      <Icon size={30} />
      <span className="text-[17px] font-semibold uppercase tracking-wider">{text}</span>
    </div>
  );
}

export function MappingSlide({ step }: SlideProps) {
  const backendW = step >= 3 ? COL_W * 2 + GAP : COL_W;

  return (
    <SlideLayout section="web" title="Тот же ресторан — в вебе">
      <RowLabel icon={UtensilsCrossed} text="ресторан" top={TOP_Y + 14} />
      <RowLabel icon={Globe} text="веб" top={BOTTOM_Y + 14} />

      {PAIRS.map((p, i) => {
        const x = COL_X(i);
        const cx = x + COL_W / 2;
        const current = i === step;
        const shown = step >= i;
        const t = TONE[p.tone];
        return (
          <div key={p.top.title}>
            {/* Ресторан — виден всегда */}
            <NodeBox
              tone={p.tone}
              icon={p.top.icon}
              title={p.top.title}
              sub={<span className="font-sans">{p.top.sub}</span>}
              state={current ? 'active' : shown ? 'idle' : 'dim'}
              className="absolute"
              style={{ left: x, top: TOP_Y, width: COL_W, height: BOX_H }}
            />

            {/* Связь пары */}
            <Arrow
              show={shown}
              from={[cx, TOP_Y + BOX_H + 8]}
              to={[cx, BOTTOM_Y - 10]}
              tone={current ? p.tone : 'muted'}
              dashed
              width={3}
            />
            <Reveal show={shown} from="scale" delay={0.25} className="absolute flex justify-center" style={{ left: x, top: (TOP_Y + BOX_H + BOTTOM_Y) / 2 - 24, width: COL_W }}>
              <div
                className={cn(
                  'rounded-2xl border-2 bg-surface px-4 py-2 text-center text-[21px] font-semibold leading-snug shadow-card transition-colors duration-300',
                  current ? cn(t.border, t.text) : 'border-border text-text-2',
                )}
              >
                {p.common}
              </div>
            </Reveal>

            {/* Веб — появляется своей парой */}
            <Reveal show={shown} from="up" className="absolute" style={{ left: x, top: BOTTOM_Y, width: COL_W }}>
              <NodeBox
                tone={p.tone}
                icon={p.bottom.icon}
                title={p.bottom.title}
                sub={<span className={p.bottom.mono ? undefined : 'font-sans'}>{p.bottom.sub}</span>}
                state={current ? 'active' : 'idle'}
                style={{ height: BOX_H }}
              />
            </Reveal>
          </div>
        );
      })}

      {/* Стрелки внутри рядов */}
      {[0, 1, 2].map((i) => {
        const x1 = COL_X(i) + COL_W + 4;
        const x2 = COL_X(i + 1) - 6;
        return (
          <div key={i}>
            <Arrow from={[x1, TOP_Y + BOX_H / 2]} to={[x2, TOP_Y + BOX_H / 2]} width={3} />
            <Arrow show={step >= i + 1} from={[x1, BOTTOM_Y + BOX_H / 2]} to={[x2, BOTTOM_Y + BOX_H / 2]} width={3} delay={0.3} />
          </div>
        );
      })}

      {/* Скобки: фронтенд / бэкенд */}
      <Brace tone="client" label="фронтенд" left={COL_X(0)} width={COL_W} show />
      <Brace tone="logic" label="бэкенд" left={COL_X(2)} width={backendW} show={step >= 2} />

      <StepCaption
        step={step}
        tone="db"
        captions={[
          'Гость в зале — это браузер: всё, что видит пользователь',
          'Официант — это HTTP: носит запросы и ответы',
          'Кухня — это сервер: здесь работает бэкенд',
          'Склад — это база данных. Сервер + база = бэкенд',
        ]}
      />
    </SlideLayout>
  );
}

function Brace({ tone, label, left, width, show }: { tone: Tone; label: string; left: number; width: number; show: boolean }) {
  const t = TONE[tone];
  return (
    <motion.div
      className="absolute"
      style={{ left, top: BRACE_Y }}
      initial={false}
      animate={{ opacity: show ? 1 : 0, width }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className={cn('h-5 rounded-b-xl border-[3px] border-t-0', t.border)} />
      <div className={cn('mt-2 text-center text-[26px] font-bold', t.text)}>{label}</div>
    </motion.div>
  );
}
