'use client';

import { motion } from 'framer-motion';
import { highlight, TOKEN_CLASS } from '@/lib/highlight';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

/**
 * Тёмная панель «данных» (объект JS/JSON по строкам) с фиксированной высотой строк —
 * чтобы стрелки между панелями можно было считать в координатах.
 */

/** Высота шапки панели. */
export const HEAD_H = 46;
/** Отступ над первой и под последней строкой. */
export const PAD_Y = 10;
/** Высота строки. */
export const ROW_H = 38;

/** y центра строки i (с нуля) относительно верха панели. */
export const rowY = (i: number) => HEAD_H + PAD_Y + i * ROW_H + ROW_H / 2;

/** Высота панели из n строк. */
export const panelH = (n: number) => HEAD_H + PAD_Y * 2 + n * ROW_H;

/**
 * Цвет текста тона НА ТЁМНОЙ панели: светлые цвета подсветки кода
 * (TONE[...].text в светлой теме слишком тёмный для bg-code-bg).
 */
export const DARK_TEXT: Record<Tone, string> = {
  client: 'text-code-text',
  guard: 'text-code-type',
  ctrl: 'text-code-fn',
  logic: 'text-code-keyword',
  prisma: 'text-code-deco',
  db: 'text-code-fn',
  git: 'text-code-number',
  success: 'text-code-string',
  warning: 'text-code-type',
  danger: 'text-code-prop',
  accent: 'text-code-fn',
  muted: 'text-code-comment',
};

interface PanelProps {
  title: React.ReactNode;
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function DataPanel({ title, tone = 'muted', className, style, children }: PanelProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-2xl bg-code-bg shadow-lift ring-1 ring-code-line/10', className)}
      style={style}
    >
      <div className="flex items-center gap-3 border-b border-code-line/10 px-5" style={{ height: HEAD_H }}>
        <span className={cn('h-3 w-3 shrink-0 rounded-full', TONE[tone].bg)} />
        <span className="truncate font-mono text-[17px] text-code-text/80">{title}</span>
      </div>
      <div style={{ paddingTop: PAD_Y, paddingBottom: PAD_Y }}>{children}</div>
    </div>
  );
}

export type LineState = 'normal' | 'hl' | 'dim' | 'off' | 'hidden';

interface LineProps {
  /** Ключ: в json-режиме рисуется в кавычках. Без ключа — строка `text` как есть. */
  k?: string;
  v?: string;
  /** Произвольная строка кода вместо пары ключ/значение. */
  text?: string;
  json?: boolean;
  state?: LineState;
  tone?: Tone;
  /** Отступ в символах. */
  indent?: number;
  /** Пояснение справа (обычным шрифтом). */
  note?: React.ReactNode;
  noteTone?: Tone;
  /** Подсветить ключ цветом тона (переименование и т.п.). */
  keyTone?: Tone;
}

const ISO_DATE = /^"?\d{4}-\d{2}-\d{2}T[\d:.]+Z"?$/;

function Value({ v, json }: { v: string; json?: boolean }) {
  // Дату красим целиком: регулярки подсветки режут её на куски.
  const bare = v.replace(/,$/, '');
  if (ISO_DATE.test(bare)) {
    return (
      <>
        <span className={bare.startsWith('"') ? TOKEN_CLASS.string : TOKEN_CLASS.number}>{bare}</span>
        {bare !== v && <span className="text-code-text">,</span>}
      </>
    );
  }
  const tokens = highlight(v, json ? 'json' : 'ts')[0] ?? [];
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={TOKEN_CLASS[t.kind]}>
          {t.text}
        </span>
      ))}
    </>
  );
}

/** Строка панели: `key: value` + пояснение справа. */
export function DataLine({
  k,
  v,
  text,
  json,
  state = 'normal',
  tone = 'accent',
  indent = 0,
  note,
  noteTone,
  keyTone,
}: LineProps) {
  const hidden = state === 'hidden';
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: hidden ? 0 : state === 'dim' ? 0.3 : state === 'off' ? 0.75 : 1,
        x: hidden ? -14 : 0,
      }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        'relative flex items-center whitespace-nowrap px-6 font-mono text-[19px] transition-colors duration-300',
        state === 'hl' && 'bg-code-line/[0.09]',
        state === 'off' && 'bg-danger/10',
      )}
      style={{ height: ROW_H }}
    >
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-1.5 transition-opacity duration-300',
          state === 'off' ? 'bg-danger' : TONE[tone].bg,
          state === 'hl' || state === 'off' ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span
        className={cn(state === 'off' && 'line-through decoration-danger decoration-2')}
        style={{ paddingLeft: `${indent}ch` }}
      >
        {text !== undefined ? (
          <Value v={text} json={json} />
        ) : (
          <>
            <span className={cn(keyTone ? cn(DARK_TEXT[keyTone], 'font-semibold') : TOKEN_CLASS.prop)}>
              {json ? `"${k}"` : k}
            </span>
            <span className="text-code-text">: </span>
            {v !== undefined && <Value v={v} json={json} />}
          </>
        )}
      </span>
      {note && (
        <span
          className={cn(
            'ml-auto pl-5 font-sans text-[17px] font-semibold',
            noteTone ? DARK_TEXT[noteTone] : 'text-code-comment',
          )}
        >
          {note}
        </span>
      )}
    </motion.div>
  );
}
