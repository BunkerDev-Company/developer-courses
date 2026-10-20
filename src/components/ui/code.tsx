import { useMemo } from 'react';
import { highlight, TOKEN_CLASS, type Lang } from '@/lib/highlight';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

const SIZE = {
  xs: 'text-[16px]',
  sm: 'text-[19px]',
  md: 'text-[22px]',
  lg: 'text-[26px]',
} as const;

interface CodeProps {
  code: string;
  lang: Lang;
  /** Номера подсвеченных строк (с 1). Остальные приглушаются. */
  hl?: number[];
  /** Цвет полоски у подсвеченной строки. */
  tone?: Tone;
  /** Разметка строк своими цветами без приглушения остальных: `{ 2: 'guard', 3: 'guard' }`. */
  marks?: Partial<Record<number, Tone>>;
  /** Имя файла во вкладке сверху. */
  title?: React.ReactNode;
  size?: keyof typeof SIZE;
  lineNumbers?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Блок кода. Панель тёмная в обеих темах — так код читается на проекторе. */
export function Code({ code, lang, hl, tone = 'accent', marks, title, size = 'md', lineNumbers, className, style }: CodeProps) {
  const lines = useMemo(() => highlight(code, lang), [code, lang]);
  const focus = hl && hl.length > 0;

  return (
    <div className={cn('overflow-hidden rounded-2xl bg-code-bg shadow-lift ring-1 ring-code-line/10', className)} style={style}>
      {title && (
        <div className="flex items-center gap-4 border-b border-code-line/10 px-5 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-code-line/15" />
            <span className="h-3 w-3 rounded-full bg-code-line/15" />
            <span className="h-3 w-3 rounded-full bg-code-line/15" />
          </span>
          <span className="font-mono text-[16px] text-code-text/70">{title}</span>
        </div>
      )}
      <pre className={cn('py-4 font-mono leading-[1.55]', SIZE[size])}>
        {lines.map((tokens, i) => {
          const n = i + 1;
          const on = focus && hl.includes(n);
          const mark = marks?.[n];
          return (
            <div
              key={i}
              className={cn(
                'relative px-6 transition-[opacity,background-color] duration-300',
                (on || mark) && 'bg-code-line/[0.09]',
                focus && !on && 'opacity-30',
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 w-1.5 transition-opacity duration-300',
                  TONE[mark ?? tone].bg,
                  on || mark ? 'opacity-100' : 'opacity-0',
                )}
              />
              {lineNumbers && (
                <span className="mr-5 inline-block w-7 select-none text-right text-code-comment/60">{n}</span>
              )}
              {tokens.length === 0 || (tokens.length === 1 && tokens[0].text === '')
                ? ' '
                : tokens.map((t, j) => (
                    <span key={j} className={TOKEN_CLASS[t.kind]}>
                      {t.text}
                    </span>
                  ))}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
