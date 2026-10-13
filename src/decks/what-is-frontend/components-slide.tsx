'use client';

import { motion } from 'framer-motion';
import { Puzzle } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { CodePanel } from './code-panel';
import { PRODUCTS } from './data';
import { BROWSER_BAR, BrowserWindow, ProductTile, ShopHeader } from './ui';

/**
 * Шаги:
 * 0 — страница магазина целиком
 * 1 — рамки: Header, ProductCard ×3, Button + дерево компонентов
 * 2 — код компонента ProductCard
 * 3 — три вызова с разными данными → три разные карточки
 */

const DEF = `type Props = { title: string; price: number };

function ProductCard({ title, price }: Props) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{formatMoney(price)}</p>
      <Button>В корзину</Button>
    </div>
  );
}`;

const USE = `<main>
  <Header />
  <ProductCard title="Кроссовки" price={4990} />
  <ProductCard title="Рюкзак" price={2490} />
  <ProductCard title="Наушники" price={3290} />
</main>`;

// Раскладка страницы внутри окна (координаты области контента слайда).
const WIN = { left: 0, top: 0, width: 760, height: 555 };
const BODY_X = WIN.left + 2;
const BODY_Y = WIN.top + BROWSER_BAR;
const HEADER = { left: 20, top: 18, width: 716, height: 60 };
const CARD_W = 224;
const CARD_H = 330;
const CARD_TOP = 156;
const CARD_LEFT = [20, 266, 512];
const BTN_INSET = 14; // padding карточки
const BTN_H = 40;

const TONES = { header: 'prisma', card: 'accent', button: 'success' } as const satisfies Record<string, Tone>;

/** Пунктирная рамка компонента с ярлыком. */
function Frame({
  show,
  tone,
  label,
  box,
  labelPos = 'top',
  labelSide = 'left',
  dim,
  delay = 0,
}: {
  show: boolean;
  tone: Tone;
  label?: string;
  box: { left: number; top: number; width: number; height: number };
  labelPos?: 'top' | 'bottom';
  labelSide?: 'left' | 'right';
  dim?: boolean;
  delay?: number;
}) {
  const t = TONE[tone];
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      style={box}
      initial={false}
      animate={{ opacity: show ? (dim ? 0.3 : 1) : 0, scale: show ? 1 : 1.04 }}
      transition={{ duration: 0.4, delay: show ? delay : 0, ease: EASE }}
    >
      <div className={cn('absolute inset-0 rounded-2xl border-[3px] border-dashed', t.border)} />
      {label && (
        <span
          className={cn(
            'absolute whitespace-nowrap rounded-lg px-2.5 py-0.5 font-mono text-[17px] font-semibold text-white shadow-card',
            t.bg,
            labelPos === 'top' ? '-top-4' : '-bottom-4',
            labelSide === 'left' ? 'left-4' : 'right-4',
          )}
        >
          {label}
        </span>
      )}
    </motion.div>
  );
}

function Num({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[18px] font-bold text-white', className)}>{n}</span>
  );
}

const TREE: { depth: number; name: string; tone: Tone | null; note?: string }[] = [
  { depth: 0, name: '<CatalogPage>', tone: null },
  { depth: 1, name: '<Header />', tone: TONES.header },
  { depth: 1, name: '<ProductCard />', tone: TONES.card, note: '× 3' },
  { depth: 2, name: '<Button />', tone: TONES.button },
];

export function ComponentsSlide({ step }: SlideProps) {
  const framed = step >= 1;
  const focusCards = step >= 2;

  return (
    <SlideLayout section="frontend" title="Интерфейс — конструктор из компонентов">
      {/* Страница магазина */}
      <BrowserWindow url="shop.ru/catalog" className="absolute" style={WIN} bodyClassName="bg-bg">
        <div className="absolute" style={HEADER}>
          <ShopHeader count={0} className="h-full" />
        </div>
        <div className="absolute text-[30px] font-bold" style={{ left: 22, top: 90 }}>
          Каталог
        </div>
        {CARD_LEFT.map((x, i) => (
          <div key={i} className="absolute" style={{ left: x, top: CARD_TOP, width: CARD_W, height: CARD_H }}>
            <ProductTile product={PRODUCTS[i]} imageH={140} className="h-full" dataHl={step >= 2} />
            <Reveal show={step === 3} from="scale" delay={0.2 + i * 0.15} className="absolute -right-3 -top-3 z-20">
              <Num n={i + 1} />
            </Reveal>
          </div>
        ))}
      </BrowserWindow>

      {/* Рамки компонентов */}
      <Frame
        show={framed}
        tone={TONES.header}
        label="<Header>"
        labelPos="bottom"
        labelSide="right"
        dim={focusCards}
        box={{ left: BODY_X + HEADER.left - 6, top: BODY_Y + HEADER.top - 6, width: HEADER.width + 12, height: HEADER.height + 12 }}
      />
      {CARD_LEFT.map((x, i) => (
        <Frame
          key={`c${i}`}
          show={framed}
          tone={TONES.card}
          label={i === 0 ? '<ProductCard>' : undefined}
          delay={0.15 + i * 0.1}
          box={{ left: BODY_X + x - 6, top: BODY_Y + CARD_TOP - 6, width: CARD_W + 12, height: CARD_H + 12 }}
        />
      ))}
      {CARD_LEFT.map((x, i) => (
        <Frame
          key={`b${i}`}
          show={framed}
          tone={TONES.button}
          label={i === 2 ? '<Button>' : undefined}
          labelPos="bottom"
          dim={step === 3}
          delay={0.45 + i * 0.1}
          box={{
            left: BODY_X + x + BTN_INSET - 5,
            top: BODY_Y + CARD_TOP + CARD_H - BTN_INSET - BTN_H - 5,
            width: CARD_W - BTN_INSET * 2 + 10,
            height: BTN_H + 10,
          }}
        />
      ))}

      {/* Справа: вопрос → дерево → код компонента → три вызова */}
      <div className="absolute" style={{ left: 790, top: 0, width: 650 }}>
        <Swap k={step}>
          {step === 0 && (
            <div className="flex flex-col items-center gap-6 pt-24 text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-accent/10 text-accent">
                <Puzzle size={64} strokeWidth={1.75} />
              </div>
              <div className="text-[34px] font-bold leading-tight">Из каких деталей
                <br />собрана страница?</div>
            </div>
          )}
          {step === 1 && (
            <div className="card flex flex-col gap-3 p-6">
              <div className="mb-1 text-[20px] font-semibold uppercase tracking-wider text-muted">дерево компонентов</div>
              {TREE.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.12, ease: EASE }}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border-2 py-2.5 pr-4 font-mono text-[24px] font-semibold',
                    r.tone ? cn(TONE[r.tone].borderSoft, TONE[r.tone].soft) : 'border-border bg-surface-2',
                  )}
                  style={{ marginLeft: r.depth * 44, paddingLeft: 16 }}
                >
                  {r.tone && <span className={cn('h-6 w-1.5 rounded-full', TONE[r.tone].bg)} />}
                  <span className={r.tone ? TONE[r.tone].text : 'text-text-2'}>{r.name}</span>
                  {r.note && <span className="ml-auto font-sans text-[22px] text-text-2">{r.note}</span>}
                </motion.div>
              ))}
              <div className="mt-2 text-[24px] leading-snug text-text-2">
                Каждый кусок — <b className="text-text">компонент</b>: отдельная деталь, которую можно переиспользовать
              </div>
            </div>
          )}
          {step === 2 && (
            <CodePanel code={DEF} lang="tsx" size="sm" title="ProductCard.tsx" hl={[3, 6, 7]} />
          )}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <CodePanel
                code={USE}
                lang="tsx"
                size="sm"
                title="CatalogPage.tsx"
                hl={[3, 4, 5]}
                marks={{ 3: <Num n={1} />, 4: <Num n={2} />, 5: <Num n={3} /> }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.5, ease: EASE }}
                className={cn('card flex items-center gap-5 border-l-[8px] px-6 py-5', TONE.accent.border)}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Puzzle size={36} />
                </div>
                <div className="text-[26px] font-semibold leading-snug">
                  Один компонент — <span className="text-accent">много карточек</span> с разными данными
                </div>
              </motion.div>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        captions={[
          'Страница магазина. Из чего она состоит?',
          'Режем на детали — компоненты',
          'Компонент — функция: получает данные, возвращает кусок экрана',
          'Пишем один раз — используем с разными данными',
        ]}
      />
    </SlideLayout>
  );
}
