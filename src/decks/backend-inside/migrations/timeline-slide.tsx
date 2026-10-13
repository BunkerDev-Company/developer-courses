'use client';

import { motion } from 'framer-motion';
import { Check, Database, Laptop, Server, Table2 } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SchemaCard, type SchemaColumn } from '@/components/ui/schema-card';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import { EASE, SPRING } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { MIGRATIONS } from './data';

/**
 * Шаги:
 * 0–3 — маркер «версия базы» едет по ленте 1 → 4, под лентой меняется схема
 * 4 — у трёх баз разные версии: Вася 4, Петя 2, прод 3
 * 5 — migrate:up у каждого докатывает недостающие → все на 4
 */

const CARD_W = 300;
const CARD_H = 124;
const GAP = (1440 - 4 * CARD_W) / 3;
const cardX = (i: number) => i * (CARD_W + GAP);
const cardCx = (i: number) => cardX(i) + CARD_W / 2;
const DATES = ['1 янв', '10 янв', '15 янв', '20 янв'];
const short = (name: string) => name.slice(name.indexOf('_') + 1);

const MARK_Y = 140;
const MARK_ROW = 50;
const MARK_W = 210;

/** Метки баз на шагах 4–5: [версия на шаге 4, иконка]. */
const DBS = [
  { name: 'база Васи', icon: Laptop, at: 3 },
  { name: 'база Пети', icon: Laptop, at: 1 },
  { name: 'прод-база', icon: Server, at: 2 },
] as const;

const TERMS: TermLine[][][] = [
  // Вася
  [
    [
      { text: '# применены 1–4', kind: 'dim' },
      { text: '# не хватает: —', kind: 'dim' },
    ],
    [
      { text: 'npm run migrate:up', kind: 'cmd' },
      { text: 'No migrations to run!', kind: 'ok' },
      { text: 'Migrations complete!', kind: 'ok' },
    ],
  ],
  // Петя
  [
    [
      { text: '# применены 1–2', kind: 'dim' },
      { text: '# не хватает: 3, 4', kind: 'dim' },
    ],
    [
      { text: 'npm run migrate:up', kind: 'cmd' },
      { text: '> Migrating files:', kind: 'dim' },
      { text: `> - …_${short(MIGRATIONS[2].name)}`, kind: 'out' },
      { text: `> - …_${short(MIGRATIONS[3].name)}`, kind: 'out' },
      { text: 'Migrations complete!', kind: 'ok' },
    ],
  ],
  // прод
  [
    [
      { text: '# применены 1–3', kind: 'dim' },
      { text: '# не хватает: 4', kind: 'dim' },
    ],
    [
      { text: 'npm run migrate:up', kind: 'cmd' },
      { text: '> Migrating files:', kind: 'dim' },
      { text: `> - …_${short(MIGRATIONS[3].name)}`, kind: 'out' },
      { text: 'Migrations complete!', kind: 'ok' },
    ],
  ],
];

const ORDER_COLUMNS: SchemaColumn[] = [
  { name: 'id', type: 'UUID', pk: true },
  { name: 'user_id', type: 'UUID' },
  { name: 'total', type: 'NUMERIC(12,2)' },
  { name: 'date_create_at', type: 'TIMESTAMP' },
];

function itemColumns(v: number): SchemaColumn[] {
  const cols: SchemaColumn[] = [
    { name: 'id', type: 'UUID', pk: true },
    { name: 'title', type: 'VARCHAR(255)' },
    { name: 'price', type: 'NUMERIC(12,2)' },
  ];
  if (v >= 1) cols.push({ name: 'stock', type: 'INT', state: v === 1 ? 'new' : 'normal' });
  if (v >= 2) cols.push({ name: 'category', type: 'VARCHAR(100)', state: v === 2 ? 'new' : 'normal' });
  return cols;
}

function Marker({ x, row, icon: Icon, label, show = true }: { x: number; row: number; icon: typeof Laptop; label: string; show?: boolean }) {
  return (
    <motion.div
      className="absolute left-0 top-0 z-10"
      initial={false}
      animate={{ x: x - MARK_W / 2, y: MARK_Y + row * MARK_ROW, opacity: show ? 1 : 0 }}
      transition={{ ...SPRING, opacity: { duration: 0.3 } }}
      style={{ width: MARK_W }}
    >
      <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-git bg-surface py-1.5 text-[20px] font-semibold text-git shadow-card">
        <Icon size={20} strokeWidth={2.25} />
        {label}
      </div>
    </motion.div>
  );
}

/** Таблица без колонок — «она есть в базе». */
function TableChip({ name, on, top }: { name: string; on: boolean; top: number }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: on ? 1 : 0.4 }}
      className={cn(
        'card absolute flex items-center gap-3 px-5 py-3 transition-[border-color,box-shadow] duration-300',
        on && 'border-db shadow-[0_0_0_6px_rgb(var(--c-db)/0.18)]',
      )}
      style={{ left: 0, top, width: 300 }}
    >
      <Table2 size={24} className="text-db" />
      <span className="font-mono text-[21px] font-semibold">&quot;{name}&quot;</span>
    </motion.div>
  );
}

export function TimelineSlide({ step }: SlideProps) {
  const multi = step >= 4;
  const v = Math.min(step, 3); // версия базы на шагах 0–3

  return (
    <SlideLayout section="migrations" title="История схемы — цепочка миграций">
      {/* Лента миграций */}
      {MIGRATIONS.map((m, i) => {
        const applied = multi || i <= v;
        const current = !multi && i === v;
        return (
          <motion.div
            key={m.name}
            initial={false}
            animate={{ opacity: applied ? 1 : 0.4 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              'absolute rounded-2xl border-2 bg-surface px-5 py-3 shadow-card transition-[border-color,box-shadow] duration-300',
              current ? 'border-git shadow-[0_0_0_6px_rgb(var(--c-git)/0.18)]' : applied ? 'border-git/40' : 'border-dashed border-border-2',
            )}
            style={{ left: cardX(i), top: 0, width: CARD_W, height: CARD_H }}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-[18px] font-bold',
                  applied ? 'bg-git text-white' : 'bg-surface-3 text-text-2',
                )}
              >
                {i + 1}
              </span>
              <span className="text-[20px] font-semibold text-git">{DATES[i]}</span>
              {applied && !multi && <Check size={24} strokeWidth={3} className="ml-auto text-success" />}
            </div>
            <div className="mt-1.5 font-mono text-[21px] font-semibold">{short(m.name)}</div>
            <div className="mt-0.5 text-[17px] text-text-2">{m.title}</div>
          </motion.div>
        );
      })}
      {[0, 1, 2].map((i) => (
        <Arrow
          key={i}
          from={[cardX(i) + CARD_W + 8, CARD_H / 2]}
          to={[cardX(i + 1) - 8, CARD_H / 2]}
          tone={multi || i + 1 <= v ? 'git' : 'muted'}
          width={3}
        />
      ))}

      {/* Маркеры версий */}
      <Marker x={cardCx(multi ? DBS[0].at : v)} row={0} icon={multi ? Laptop : Database} label={multi ? DBS[0].name : 'версия базы'} />
      {[1, 2].map((d) => (
        <Marker key={d} x={cardCx(step >= 5 ? 3 : DBS[d].at)} row={d} icon={DBS[d].icon} label={DBS[d].name} show={multi} />
      ))}

      {/* Низ: схема базы (0–3) или терминалы трёх машин (4–5) */}
      <div className="absolute" style={{ left: 0, top: 236, width: 1440 }}>
        <Swap k={multi ? 'terms' : 'schema'}>
          {multi ? (
            <div className="flex gap-[30px]" style={{ paddingTop: 64 }}>
              {TERMS.map((t, i) => (
                <Terminal
                  key={i}
                  title={DBS[i].name}
                  lines={step >= 5 ? [...t[0], ...t[1]] : t[0]}
                  style={{ width: 460, height: 245 }}
                />
              ))}
            </div>
          ) : (
            <div className="relative" style={{ height: 300 }}>
              <div className="absolute flex items-center gap-2 text-[20px] font-semibold text-db" style={{ left: 0, top: 0 }}>
                <Database size={22} />
                PostgreSQL
              </div>
              {['User', 'ErrorLog'].map((t, i) => (
                <TableChip key={t} name={t} on={v === 0} top={48 + i * 76} />
              ))}
              <SchemaCard
                name="Item"
                columns={itemColumns(v)}
                state={v <= 2 ? 'hl' : 'normal'}
                className="absolute"
                style={{ left: cardX(1), top: 0, width: 440 }}
              />
              <Reveal show={v >= 3} from="scale" className="absolute" style={{ left: 1000, top: 0, width: 440 }}>
                <SchemaCard name="Order" columns={ORDER_COLUMNS} state="hl" />
              </Reveal>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'initial-schema: в пустой базе появились User, Item, ErrorLog',
          'add-item-stock: в "Item" добавилась колонка stock',
          'add-item-category: ещё одна колонка — category',
          'create-order: новая таблица "Order". Версия = последняя применённая',
          'У каждой базы своя версия: Вася на 4-й, Петя на 2-й, прод на 3-й',
          'migrate:up докатывает каждую базу до конца — по порядку',
        ]}
      />
    </SlideLayout>
  );
}
