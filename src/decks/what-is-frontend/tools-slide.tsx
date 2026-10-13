'use client';

import { motion } from 'framer-motion';
import { Atom, CircleAlert, Route, ShieldCheck, Wind } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { FileTree, type FileItem } from '@/components/ui/file-tree';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { CodePanel } from './code-panel';
import { PRODUCTS } from './data';
import { BrowserWindow, ProductTile } from './ui';

/**
 * Шаги — по инструменту на шаг (стек etalon-frontend):
 * 0 — React: компоненты
 * 1 — Next.js: папки в src/app → адреса страниц
 * 2 — TypeScript: опечатка подчёркнута ещё до запуска
 * 3 — Tailwind: стили классами
 */

const TOOLS: { name: string; role: string; icon: typeof Atom; tone: Tone }[] = [
  { name: 'React', role: 'компоненты', icon: Atom, tone: 'db' },
  { name: 'Next.js', role: 'страницы и адреса', icon: Route, tone: 'client' },
  { name: 'TypeScript', role: 'типы ловят ошибки', icon: ShieldCheck, tone: 'ctrl' },
  { name: 'Tailwind', role: 'стили классами', icon: Wind, tone: 'prisma' },
];

const REACT_CODE = `<ProductCard title="Рюкзак" price={2490} />`;

const TS_CODE = `interface Item {
  title: string;
  price: number;
}

function total(item: Item, qty: number) {
  return item.prise * qty;
}`;

const TW_CODE = `<button className="rounded-xl bg-blue-600 px-6 py-3 text-white">
  В корзину
</button>`;

// Структура src/app в etalon-frontend: (группы) в адрес не попадают.
const ROUTES: FileItem[] = [
  { name: 'src/app/', depth: 0, kind: 'dir' },
  { name: '(auth)/login/', depth: 1, kind: 'dir', state: 'dim' },
  { name: 'page.tsx', depth: 2, kind: 'ts', note: '→ /login', state: 'dim' },
  { name: '(dashboard)/items/', depth: 1, kind: 'dir' },
  { name: 'page.tsx', depth: 2, kind: 'ts', note: '→ /items', state: 'hl' },
  { name: '(shop)/catalog/', depth: 1, kind: 'dir', state: 'dim' },
  { name: 'page.tsx', depth: 2, kind: 'ts', note: '→ /catalog', state: 'dim' },
];

const TW_CLASSES: [string, string][] = [
  ['rounded-xl', 'скругление'],
  ['bg-blue-600', 'синий фон'],
  ['px-6 py-3', 'отступы'],
  ['text-white', 'белый текст'],
];

const PANEL = { left: 440, top: 0, width: 1000 };

function ReactPanel() {
  return (
    <div className="relative" style={{ height: 520 }}>
      <CodePanel code={REACT_CODE} lang="tsx" title="CatalogPage.tsx" className="absolute" style={{ left: 0, top: 110, width: 640 }} />
      <Arrow from={[652, 172]} to={[730, 172]} tone="db" delay={0.3} />
      <motion.div
        className="absolute"
        style={{ left: 740, top: 30, width: 260 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.5, ease: EASE }}
      >
        <ProductTile product={PRODUCTS[1]} imageH={130} />
      </motion.div>
      <div className="absolute text-[26px] leading-snug text-text-2" style={{ left: 0, top: 330, width: 640 }}>
        Пишем, <b className="text-text">что</b> показать, — React сам рисует экран и перерисовывает, когда меняются данные.
      </div>
    </div>
  );
}

function NextPanel() {
  return (
    <div className="flex items-start gap-8">
      <FileTree items={ROUTES} tone="client" style={{ width: 520 }} />
      <div className="flex flex-1 flex-col gap-5 pt-4">
        <BrowserWindow url="localhost:3001/items" style={{ height: 150 }} bodyClassName="flex items-center justify-center bg-bg">
          <span className="text-[24px] font-semibold">Товары</span>
        </BrowserWindow>
        <div className="text-[24px] leading-snug text-text-2">
          Папка в <M>src/app</M> = адрес страницы. Папки в <M>(скобках)</M> только группируют — в адрес не попадают.
        </div>
      </div>
    </div>
  );
}

function TsPanel() {
  return (
    <div className="flex flex-col gap-5">
      <CodePanel code={TS_CODE} lang="ts" title="cart.ts" hl={[3, 7]} tone="danger" wavy={{ line: 7, text: 'prise' }} style={{ width: 700 }} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5, ease: EASE }}
        className="flex items-start gap-4 rounded-2xl border-2 border-danger/50 bg-danger/5 px-6 py-4"
      >
        <CircleAlert size={30} className="mt-0.5 shrink-0 text-danger" />
        <div>
          <div className="font-mono text-[19px] leading-snug">
            Property &apos;prise&apos; does not exist on type &apos;Item&apos;. Did you mean &apos;price&apos;?
          </div>
          <div className="mt-2 text-[24px] text-text-2">Ошибку видно сразу в редакторе — до запуска, а не у пользователя</div>
        </div>
      </motion.div>
    </div>
  );
}

function TwPanel() {
  return (
    <div className="flex flex-col gap-6">
      <CodePanel code={TW_CODE} lang="tsx" title="AddButton.tsx" />
      <div className="flex items-center gap-10">
        <div className="grid flex-1 grid-cols-2 gap-3">
          {TW_CLASSES.map(([cls, text], i) => (
            <motion.div
              key={cls}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.12, ease: EASE }}
              className="flex items-center gap-3 rounded-xl border-2 border-border bg-surface px-4 py-2.5"
            >
              <span className={cn('font-mono text-[20px] font-semibold', TONE.prisma.text)}>{cls}</span>
              <span className="text-[20px] text-text-2">→ {text}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.9, ease: EASE }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[17px] font-semibold uppercase tracking-wider text-muted">результат</span>
          <span className="rounded-xl bg-accent px-6 py-3 text-[24px] font-semibold text-white shadow-card">В корзину</span>
        </motion.div>
      </div>
    </div>
  );
}

export function ToolsSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="frontend" title="Наши инструменты">
      {/* Слева: стек — по одному на шаг */}
      {TOOLS.map((t, i) => (
        <Reveal key={t.name} show={step >= i} from="right" className="absolute" style={{ left: 0, top: i * 128, width: 390 }}>
          <NodeBox tone={t.tone} icon={t.icon} title={t.name} state={step === i ? 'active' : 'idle'}>
            <div className="mt-1 text-[19px] text-text-2">{t.role}</div>
          </NodeBox>
        </Reveal>
      ))}

      {/* Справа: мини-пример текущего инструмента */}
      <div className="absolute" style={PANEL}>
        <Swap k={step}>
          {step === 0 && <ReactPanel />}
          {step === 1 && <NextPanel />}
          {step === 2 && <TsPanel />}
          {step === 3 && <TwPanel />}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={TOOLS[Math.min(step, 3)].tone}
        captions={[
          'React — собираем интерфейс из компонентов',
          'Next.js — страницы и адреса: папка = маршрут',
          'TypeScript — ловит опечатки ещё до запуска',
          'Tailwind — стили классами прямо в разметке',
        ]}
      />
    </SlideLayout>
  );
}
