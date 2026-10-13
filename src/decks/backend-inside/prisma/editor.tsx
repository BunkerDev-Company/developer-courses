'use client';

import { motion } from 'framer-motion';
import { Box, CircleX, FileCode2, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { highlight, TOKEN_CLASS } from '@/lib/highlight';
import { cn } from '@/lib/utils';

/**
 * Мок редактора кода (VS Code): строки TS, курсор, выпадающий автокомплит,
 * красное подчёркивание и всплывающая ошибка. Координаты оверлеев — в символах,
 * шрифт моноширинный (JetBrains Mono, ширина символа 0.6em).
 */

const FS = 22;
const CH = FS * 0.6;
const LH = 36;
const GUTTER = 58;
const PAD_X = 18;
const PAD_Y = 14;

/** Левый край символа col (с 0) и верх строки line (с 1) в координатах тела редактора. */
const xOf = (col: number) => PAD_X + GUTTER + col * CH;
const yOf = (line: number) => PAD_Y + (line - 1) * LH;

export interface Suggestion {
  label: string;
  kind: 'method' | 'field';
  /** Тип справа серым: «string | null». */
  detail?: string;
}

interface EditorProps {
  file: string;
  code: string;
  /** Номер первой строки (для колонки номеров). */
  firstLine?: number;
  /** Минимальная высота тела в строках — чтобы оверлеи помещались. */
  rows?: number;
  cursor?: { line: number; col: number };
  squiggle?: { line: number; col: number; len: number };
  popup?: {
    line: number;
    col: number;
    items: Suggestion[];
    selected?: number;
    /** Сколько первых символов подсвечено как совпадение. */
    match?: number;
    footer?: React.ReactNode;
  };
  tooltip?: { line: number; col: number; width: number; children: React.ReactNode };
  /** Панель PROBLEMS внизу редактора: текст ошибки и «ts(2561) [Ln 4, Col 7]». */
  problem?: { text: React.ReactNode; where: string };
  className?: string;
  style?: React.CSSProperties;
}

export function Editor({ file, code, firstLine = 1, rows, cursor, squiggle, popup, tooltip, problem, className, style }: EditorProps) {
  const lines = useMemo(() => highlight(code, 'ts'), [code]);
  const bodyRows = Math.max(rows ?? 0, lines.length);

  return (
    <div className={cn('overflow-hidden rounded-2xl bg-code-bg shadow-lift ring-1 ring-code-line/10', className)} style={style}>
      {/* Вкладка файла */}
      <div className="flex items-center gap-4 border-b border-code-line/10 px-5 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-code-line/15" />
          <span className="h-3 w-3 rounded-full bg-code-line/15" />
          <span className="h-3 w-3 rounded-full bg-code-line/15" />
        </span>
        <span className="flex items-center gap-2 font-mono text-[16px] text-code-text/70">
          <FileCode2 size={17} className="text-code-fn" />
          {file}
        </span>
      </div>

      <div className="relative font-mono" style={{ height: PAD_Y * 2 + bodyRows * LH, fontSize: FS }}>
        {lines.map((tokens, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 flex whitespace-pre"
            style={{ top: yOf(i + 1), height: LH, lineHeight: `${LH}px`, paddingLeft: PAD_X }}
          >
            <span className="shrink-0 select-none pr-4 text-right text-code-comment/50" style={{ width: GUTTER }}>
              {firstLine + i}
            </span>
            <span>
              {tokens.map((t, j) => (
                <span key={j} className={TOKEN_CLASS[t.kind]}>
                  {t.text}
                </span>
              ))}
            </span>
          </div>
        ))}

        {squiggle && (
          <motion.span
            key={`sq-${squiggle.line}-${squiggle.col}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="absolute whitespace-pre text-transparent underline decoration-danger decoration-wavy decoration-2 underline-offset-[7px]"
            style={{ left: xOf(squiggle.col), top: yOf(squiggle.line), lineHeight: `${LH}px` }}
          >
            {'x'.repeat(squiggle.len)}
          </motion.span>
        )}

        {cursor && (
          <motion.span
            className="absolute w-[3px] rounded-full bg-code-text"
            style={{ left: xOf(cursor.col) - 1, top: yOf(cursor.line) + 6, height: LH - 12 }}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.55, 1] }}
          />
        )}

        {popup && (
          <motion.div
            key={`pp-${popup.line}-${popup.col}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            className="absolute z-10 overflow-hidden rounded-lg bg-code-bg shadow-lift ring-1 ring-code-line/25"
            style={{ left: xOf(popup.col) - 34, top: yOf(popup.line) + LH + 2, minWidth: 360 }}
          >
            <div className="bg-code-line/[0.07] py-1">
              {popup.items.map((it, i) => {
                const Icon = it.kind === 'method' ? Box : Wrench;
                const sel = i === (popup.selected ?? 0);
                const m = popup.match ?? 0;
                return (
                  <div
                    key={it.label}
                    className={cn('flex items-center gap-2.5 px-2.5 text-[20px]', sel && 'bg-ctrl/40')}
                    style={{ height: 33 }}
                  >
                    <Icon size={18} className={it.kind === 'method' ? 'text-code-keyword' : 'text-code-fn'} />
                    <span className="text-code-text">
                      <span className="font-bold text-code-fn">{it.label.slice(0, m)}</span>
                      {it.label.slice(m)}
                    </span>
                    {it.detail && <span className="ml-auto pl-8 text-[17px] text-code-comment">{it.detail}</span>}
                  </div>
                );
              })}
              {popup.footer && (
                <div className="border-t border-code-line/10 px-3 pt-1 font-sans text-[16px] text-code-comment">{popup.footer}</div>
              )}
            </div>
          </motion.div>
        )}

        {problem && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.5 }}
            className="absolute inset-x-0 bottom-0 border-t border-code-line/15 bg-code-line/[0.05] px-5 pb-4 pt-2.5 font-sans"
          >
            <div className="text-[15px] font-semibold uppercase tracking-wider text-code-text/60">
              Problems <span className="ml-1 rounded-full bg-danger px-2 py-0.5 text-white">1</span>
            </div>
            <div className="mt-2 flex gap-3 text-[19px] leading-snug text-code-text">
              <CircleX size={22} className="mt-0.5 shrink-0 text-danger" />
              <div>
                {problem.text} <span className="font-mono text-[16px] text-code-comment">{problem.where}</span>
              </div>
            </div>
          </motion.div>
        )}

        {tooltip && (
          <motion.div
            key={`tt-${tooltip.line}-${tooltip.col}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.55 }}
            className="absolute z-10 overflow-hidden rounded-lg bg-code-bg shadow-lift ring-2 ring-danger/70"
            style={{ left: xOf(tooltip.col) - 12, top: yOf(tooltip.line) + LH + 8, width: tooltip.width }}
          >
            <div className="bg-code-line/[0.07] px-4 py-3 font-sans text-[20px] leading-snug text-code-text">{tooltip.children}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
