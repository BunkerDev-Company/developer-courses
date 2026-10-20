'use client';

import type { LucideIcon } from 'lucide-react';
import { CircleCheck, CircleX } from 'lucide-react';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

/** Геометрия Code size="sm": 19px × 1.55, шапка 45, отступ 16. y центра строки n (с 1). */
export const CODE_LH = 19 * 1.55;
export const codeLineY = (top: number, n: number, titled = true) => top + (titled ? 45 : 0) + 16 + (n - 0.5) * CODE_LH;
/** Высота панели Code size="sm" из n строк. */
export const codeH = (n: number, titled = true) => (titled ? 45 : 0) + 32 + n * CODE_LH;

/** Карточка с иконкой и заголовком; active — подсветка тоном. */
export function Card({
  tone,
  icon: Icon,
  title,
  active,
  className,
  style,
  children,
}: {
  tone: Tone;
  icon?: LucideIcon;
  title?: React.ReactNode;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn('card px-5 py-4 transition-[border-color,box-shadow] duration-300', active && cn(t.border, t.ring), className)}
      style={style}
    >
      {(Icon || title) && (
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
              <Icon size={24} />
            </div>
          )}
          {title && <div className="min-w-0 text-[24px] font-bold leading-tight">{title}</div>}
        </div>
      )}
      {children && <div className={cn(Icon || title ? 'mt-3' : '')}>{children}</div>}
    </div>
  );
}

/** Строка-вывод «да/нет»: зелёная галочка или красный крест + текст. */
export function Point({ ok, children, className }: { ok: boolean; children: React.ReactNode; className?: string }) {
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <div className={cn('flex items-start gap-3 text-[24px] leading-snug', className)}>
      <Icon size={28} className={cn('mt-0.5 shrink-0', ok ? 'text-success' : 'text-danger')} />
      <span>{children}</span>
    </div>
  );
}

/** Тёмная панель с выводом базы/консоли: ошибка — красным, остальное — серым. */
export function Console({
  title,
  lines,
  className,
  style,
}: {
  title: string;
  lines: { text: string; kind?: 'err' | 'ok' | 'dim' | 'out' }[];
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-code-bg shadow-lift ring-1 ring-code-line/10', className)} style={style}>
      <div className="border-b border-code-line/10 px-5 py-2.5 font-mono text-[16px] text-code-text/70">{title}</div>
      <div className="px-5 py-3 font-mono text-[19px] leading-[1.5]">
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              'whitespace-pre-wrap',
              l.kind === 'err' && 'text-code-prop',
              l.kind === 'ok' && 'text-code-string',
              l.kind === 'dim' && 'text-code-comment',
              (!l.kind || l.kind === 'out') && 'text-code-text/85',
            )}
          >
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Маленькая подпись-заголовок над блоком: «В КОДЕ», «В БАЗЕ». */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-[16px] font-semibold uppercase tracking-wider text-muted', className)}>{children}</div>;
}
