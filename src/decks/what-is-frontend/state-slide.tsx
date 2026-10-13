'use client';

import { motion } from 'framer-motion';
import { Arrow } from '@/components/ui/arrow';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { CodePanel } from './code-panel';
import { PRODUCTS } from './data';
import { BrowserWindow, Cursor, ProductTile, ShopHeader } from './ui';

/**
 * Шаги:
 * 0 — useState(0): в «памяти» компонента count = 0, бейдж 0
 * 1 — клик по кнопке → onAdd → setCount(count + 1)
 * 2 — состояние стало 1
 * 3 — React перерисовал: бейдж в шапке показывает 1
 */

const CODE = `function Shop() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header cartCount={count} />
      <ProductCard
        title="Кроссовки"
        price={4990}
        onAdd={() => setCount(count + 1)}
      />
    </>
  );
}`;

const HL = [[2], [10], [2, 10], [6]];

// Координаты (область контента).
const CODE_BOX = { left: 790, top: 0, width: 650 };
const LINE_Y = (n: number) => 44 + 16 + (n - 0.5) * 29.45;
const CELL = { left: 520, top: 0, width: 220, height: 180 };
const BROWSER = { left: 0, top: 0, width: 470, height: 490 };
const CARD = { left: 85, top: 160, width: 300 };

export function StateSlide({ step }: SlideProps) {
  const count = step >= 2 ? 1 : 0;
  const badge = step >= 3 ? 1 : 0;

  return (
    <SlideLayout section="frontend" title="Состояние: данные → картинка">
      {/* Интерфейс */}
      <BrowserWindow url="shop.ru" className="absolute" style={BROWSER} bodyClassName="bg-bg">
        <div className="absolute" style={{ left: 16, top: 16, right: 16 }}>
          <ShopHeader count={badge} countFrom={step === 3 ? 0 : undefined} cartDelay={0.7} cartActive={step === 3} search={false} />
        </div>
      </BrowserWindow>
      <div className="absolute" style={CARD}>
        <ProductTile product={PRODUCTS[0]} imageH={130} buttonActive={step === 1} />
      </div>
      {step === 1 && <Cursor from={[420, 560]} to={[260, 400]} delay={0.1} />}

      {/* Состояние — ячейка памяти */}
      <motion.div
        className={cn(
          'card absolute flex flex-col items-center justify-center gap-1 transition-[border-color,box-shadow] duration-300',
          step === 2 && cn(TONE.accent.border, TONE.accent.ring),
          step === 0 && TONE.accent.borderSoft,
        )}
        style={CELL}
        initial={false}
        animate={{ scale: step === 2 ? 1.05 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <span className="text-[17px] font-semibold uppercase tracking-wider text-muted">состояние</span>
        <span className="font-mono text-[24px] font-semibold text-text-2">count</span>
        <motion.span
          key={count}
          className={cn('font-mono text-[76px] font-bold leading-none', count > 0 ? 'text-accent' : 'text-text')}
          initial={step === 2 ? { scale: 0.3, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.5 }}
        >
          {count}
        </motion.span>
      </motion.div>

      {/* Код */}
      <CodePanel code={CODE} lang="tsx" size="sm" title="Shop.tsx" hl={HL[step]} className="absolute" style={CODE_BOX} />

      {/* ① клик → onAdd */}
      <Arrow
        show={step >= 1}
        from={[CARD.left + CARD.width + 10, 400]}
        to={[CODE_BOX.left - 8, LINE_Y(10)]}
        tone={step === 1 ? 'accent' : 'muted'}
        flow={step === 1}
        curve={-20}
        delay={0.6}
        label="клик"
      />
      {/* ② setCount → состояние */}
      <Arrow
        show={step >= 2}
        from={[CODE_BOX.left - 8, LINE_Y(10) - 14]}
        to={[CELL.left + CELL.width / 2 + 30, CELL.top + CELL.height + 10]}
        tone={step === 2 ? 'accent' : 'muted'}
        flow={step === 2}
        curve={-40}
        label={<M className="bg-transparent">count + 1</M>}
        labelOffset={[10, 0]}
      />
      {/* ③ состояние → бейдж */}
      <Arrow
        show={step >= 3}
        from={[CELL.left - 8, 96]}
        to={[BROWSER.left + BROWSER.width - 34, 96]}
        tone="accent"
        flow={step === 3}
        delay={0.2}
      />

      <StepCaption
        step={step}
        captions={[
          <>
            <M>useState</M> — память компонента: сейчас count = 0
          </>,
          <>
            Клик → вызывается <M>setCount(count + 1)</M>
          </>,
          'Состояние изменилось: теперь count = 1',
          'React сам перерисовал экран — в бейдже 1',
        ]}
      />
    </SlideLayout>
  );
}
