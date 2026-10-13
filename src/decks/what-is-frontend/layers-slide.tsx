'use client';

import { motion } from 'framer-motion';
import { House, Lightbulb, PaintRoller } from 'lucide-react';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE, range } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { CodePanel } from './code-panel';
import { LAYER_TONE, money, PRODUCTS } from './data';
import { BrowserWindow, Cursor } from './ui';

/**
 * Шаги:
 * 0 — голый HTML: всё есть, но некрасиво (рядом index.html)
 * 1 — + CSS: та же карточка, но красивая (рядом styles.css)
 * 2 — + JS: клик «В корзину» → счётчик 0 → 1 (рядом app.js)
 * 3 — аналогия: каркас дома, отделка, электричество
 */

const HTML = `<p>Корзина: <span id="cart-count">0</span></p>

<div class="card">
  <img src="sneakers.png" alt="Кроссовки">
  <h3>Кроссовки</h3>
  <p class="price">4 990 ₽</p>
  <button>В корзину</button>
</div>`;

const CSS = `body { font-family: sans-serif; }
.card {
  width: 300px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px #0003;
}
.price { font-weight: bold; }
button {
  background: #2563eb;
  color: white;
  border-radius: 12px;
}`;

const JS = `let count = 0;
const button = document.querySelector('button');
const counter = document.querySelector('#cart-count');

button.addEventListener('click', () => {
  count = count + 1;
  counter.textContent = count;
});`;

const LAYERS: { key: 'html' | 'css' | 'js'; name: string; role: string }[] = [
  { key: 'html', name: 'HTML', role: 'скелет' },
  { key: 'css', name: 'CSS', role: 'внешний вид' },
  { key: 'js', name: 'JS', role: 'поведение' },
];

const ANALOGY: { key: 'html' | 'css' | 'js'; icon: typeof House; title: string; text: string }[] = [
  { key: 'html', icon: House, title: 'Каркас дома', text: 'стены и комнаты — что вообще есть' },
  { key: 'css', icon: PaintRoller, title: 'Отделка', text: 'краска, обои, мебель — как выглядит' },
  { key: 'js', icon: Lightbulb, title: 'Электричество', text: 'нажал выключатель — загорелся свет' },
];

const sneakers = PRODUCTS[0];
const CLICK = 1.0; // момент клика на шаге 2

/** Число, которое меняется с `from` на `to` через `delay` секунд. */
function Counter({ from, to, delay }: { from: number; to: number; delay: number }) {
  if (from === to) return <span>{to}</span>;
  return (
    <span className="relative inline-block">
      <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.05, delay }}>
        {from}
      </motion.span>
      <motion.span
        className="absolute left-0 top-0 text-accent"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 12, delay, opacity: { duration: 0.05, delay } }}
      >
        {to}
      </motion.span>
    </span>
  );
}

/** Страница без CSS: стили браузера по умолчанию (шрифт с засечками, серая кнопка). */
function RawPage() {
  const Icon = sneakers.icon;
  return (
    <div className="p-4 font-serif text-[22px] leading-normal text-text">
      <p className="mb-5">Корзина: 0</p>
      <div className={cn('flex h-[120px] w-[150px] items-center justify-center', TONE[sneakers.tone].soft, TONE[sneakers.tone].text)}>
        <Icon size={64} strokeWidth={1.5} />
      </div>
      <h3 className="my-4 text-[28px] font-bold">Кроссовки</h3>
      <p className="mb-5">{money(sneakers.price)}</p>
      <span className="rounded-[3px] border border-border-2 bg-surface-3 px-2 py-0.5 font-sans text-[18px]">В корзину</span>
    </div>
  );
}

/** Та же страница с CSS. На шаге 2 — счётчик меняется после клика. */
function StyledPage({ step }: { step: number }) {
  const Icon = sneakers.icon;
  const count = step >= 2 ? 1 : 0;
  return (
    <div className="flex h-full flex-col items-center p-4 font-sans">
      <p
        className={cn(
          'mb-6 self-start rounded-full px-4 py-1.5 text-[22px] transition-colors duration-300',
          step === 2 ? 'bg-accent/10' : 'bg-transparent',
        )}
      >
        Корзина: <span>{step === 2 ? <Counter from={0} to={1} delay={CLICK} /> : count}</span>
      </p>
      <div className="flex w-[300px] flex-col gap-3 rounded-2xl bg-surface p-6 shadow-lift ring-1 ring-border">
        <div className={cn('flex h-[120px] items-center justify-center rounded-xl', TONE[sneakers.tone].soft, TONE[sneakers.tone].text)}>
          <Icon size={64} strokeWidth={1.5} />
        </div>
        <div className="text-[28px] font-semibold leading-tight">Кроссовки</div>
        <div className="text-[26px] font-bold leading-tight">{money(sneakers.price)}</div>
        <div
          className={cn(
            'mt-1 flex h-12 items-center justify-center rounded-xl bg-accent text-[20px] font-semibold text-white transition-shadow duration-300',
            step === 2 && TONE.accent.ring,
          )}
        >
          В корзину
        </div>
      </div>
    </div>
  );
}

export function LayersSlide({ step }: SlideProps) {
  const lit = (i: number) => (step >= 3 ? true : i <= step);
  const current: Tone = step === 0 ? LAYER_TONE.html : step === 1 ? LAYER_TONE.css : step === 2 ? LAYER_TONE.js : 'accent';

  return (
    <SlideLayout section="frontend" title="HTML, CSS, JavaScript">
      {/* Три слоя — загораются по очереди */}
      <div className="absolute flex gap-3" style={{ left: 0, top: 0, width: 600 }}>
        {LAYERS.map((l, i) => {
          const t = TONE[LAYER_TONE[l.key]];
          const on = lit(i);
          const now = step === i;
          return (
            <motion.div
              key={l.key}
              initial={false}
              animate={{ opacity: on ? 1 : 0.3 }}
              transition={{ duration: 0.4, ease: EASE }}
              className={cn(
                'flex flex-1 items-baseline justify-center gap-2 whitespace-nowrap rounded-xl border-2 px-3 py-2 transition-[border-color,box-shadow,background-color] duration-300',
                on ? cn(t.border, t.soft) : 'border-border bg-surface',
                now && t.ring,
              )}
            >
              <span className={cn('font-mono text-[22px] font-bold', t.text)}>{l.name}</span>
              <span className="text-[18px] text-text-2">{l.role}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Результат в браузере */}
      <BrowserWindow url="shop.ru" className="absolute" style={{ left: 0, top: 70, width: 600, height: 480 }} bodyClassName="bg-surface">
        <Swap k={step === 0 ? 'raw' : 'css'} className="h-full">
          {step === 0 ? <RawPage /> : <StyledPage step={step} />}
        </Swap>
      </BrowserWindow>
      {step === 2 && <Cursor from={[560, 560]} to={[340, 484]} delay={CLICK - 0.85} />}

      {/* Справа — код слоя или аналогия */}
      <div className="absolute" style={{ left: 650, top: 0, width: 790 }}>
        <Swap k={step}>
          {step === 0 && <CodePanel code={HTML} lang="html" title="index.html" titleTone={LAYER_TONE.html} tone={LAYER_TONE.html} />}
          {step === 1 && <CodePanel code={CSS} lang="css" title="styles.css" titleTone={LAYER_TONE.css} tone={LAYER_TONE.css} />}
          {step === 2 && (
            <CodePanel code={JS} lang="ts" title="app.js" titleTone={LAYER_TONE.js} tone={LAYER_TONE.js} hl={range(5, 8)} />
          )}
          {step === 3 && (
            <div className="flex flex-col gap-5 pt-1">
              {ANALOGY.map((a, i) => {
                const t = TONE[LAYER_TONE[a.key]];
                return (
                  <motion.div
                    key={a.key}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 + i * 0.2, ease: EASE }}
                    className={cn('card flex items-center gap-6 border-l-[8px] px-6 py-5', t.border)}
                  >
                    <span className={cn('w-[86px] shrink-0 font-mono text-[26px] font-bold', t.text)}>{LAYERS[i].name}</span>
                    <div className={cn('flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                      <a.icon size={44} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-[30px] font-bold leading-tight">{a.title}</div>
                      <div className="mt-1 text-[24px] leading-snug text-text-2">{a.text}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={current}
        captions={[
          'HTML — что есть на странице: текст, картинка, кнопка',
          'CSS — как это выглядит: шрифты, отступы, цвета',
          'JavaScript — что происходит, когда нажали',
          'Как дом: каркас, отделка и электричество',
        ]}
      />
    </SlideLayout>
  );
}
