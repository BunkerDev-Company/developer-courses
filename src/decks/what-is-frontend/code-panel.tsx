import { Fragment, useMemo } from 'react';
import { highlight, TOKEN_CLASS, type Lang, type Token, type TokenKind } from '@/lib/highlight';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

/**
 * Панель кода для этой презентации. Как общий `Code`, но умеет ещё html / css / tsx
 * (в lib/highlight их нет), метки справа от строк и волнистое подчёркивание ошибки.
 */

export type WebLang = Lang | 'html' | 'css' | 'tsx';

type Rule = [RegExp, TokenKind];

const TS_KEYWORDS =
  'import|from|export|const|let|var|function|return|async|await|new|class|extends|interface|type|if|else|throw|typeof|of|in|for|true|false|null|undefined|this|as|try|catch';

const RULES: Record<'html' | 'css' | 'tsx', Rule[]> = {
  html: [
    [/<!--.*?-->/, 'comment'],
    [/<\/?[a-zA-Z][\w-]*/, 'prop'],
    [/[a-zA-Z-]+(?==)/, 'number'],
    [/"[^"]*"/, 'string'],
  ],
  css: [
    [/\/\*.*?\*\//, 'comment'],
    [/^[^\s{][^{]*?(?=\s*\{)/, 'type'],
    [/[a-z-]+(?=\s*:)/, 'fn'],
    [/#[0-9a-fA-F]{3,8}\b/, 'number'],
    [/-?\b\d+(?:\.\d+)?(?:px|%|em|rem|s)?/, 'number'],
    [/'[^']*'|"[^"]*"/, 'string'],
    [/\b(?:white|black|none|bold|solid|auto|sans-serif)\b/, 'keyword'],
  ],
  tsx: [
    [/\/\/.*$/, 'comment'],
    [/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/, 'string'],
    [/<\/?>/, 'prop'],
    [/<\/?[A-Z][\w.]*/, 'type'],
    [/<\/?[a-z][\w-]*(?=[\s>/])/, 'prop'],
    [/\b[a-zA-Z]+(?==[{"'])/, 'number'],
    [new RegExp(`\\b(?:${TS_KEYWORDS})\\b`), 'keyword'],
    [/\b\d+(?:\.\d+)?\b/, 'number'],
    [/\b[A-Z][A-Za-z0-9_]*\b/, 'type'],
    [/\b[a-zA-Z_$][\w$]*(?=\s*\()/, 'fn'],
  ],
};

function tokenize(line: string, rules: Rule[]): Token[] {
  const tokens: Token[] = [];
  let rest = line;
  let first = true;
  while (rest.length > 0) {
    let best: { index: number; text: string; kind: TokenKind } | null = null;
    for (const [re, kind] of rules) {
      // ^-правила (селектор CSS) — только в начале строки.
      if (!first && re.source.startsWith('^')) continue;
      const m = re.exec(rest);
      if (m && m[0].length > 0 && (best === null || m.index < best.index)) {
        best = { index: m.index, text: m[0], kind };
        if (m.index === 0) break;
      }
    }
    if (!best) {
      tokens.push({ text: rest, kind: 'plain' });
      break;
    }
    if (best.index > 0) tokens.push({ text: rest.slice(0, best.index), kind: 'plain' });
    tokens.push({ text: best.text, kind: best.kind });
    rest = rest.slice(best.index + best.text.length);
    first = false;
  }
  return tokens;
}

function highlightWeb(code: string, lang: WebLang): Token[][] {
  if (lang === 'html' || lang === 'css' || lang === 'tsx') {
    const rules = RULES[lang];
    return code.replace(/\n$/, '').split('\n').map((l) => tokenize(l, rules));
  }
  return highlight(code, lang);
}

/** Разрезает токены строки так, чтобы `text` стал отдельным куском (для подчёркивания). */
type MarkedToken = Token & { mark?: boolean };

function splitAt(tokens: Token[], text: string): MarkedToken[] {
  const out: MarkedToken[] = [];
  let done = false;
  for (const t of tokens) {
    const i = done ? -1 : t.text.indexOf(text);
    if (i < 0) {
      out.push(t);
      continue;
    }
    if (i > 0) out.push({ text: t.text.slice(0, i), kind: t.kind });
    out.push({ text, kind: t.kind, mark: true });
    if (i + text.length < t.text.length) out.push({ text: t.text.slice(i + text.length), kind: t.kind });
    done = true;
  }
  return out;
}

const SIZE = { sm: 'text-[19px]', md: 'text-[22px]', lg: 'text-[26px]' } as const;

interface CodePanelProps {
  code: string;
  lang: WebLang;
  /** Подсвеченные строки (с 1). Остальные приглушаются. */
  hl?: number[];
  tone?: Tone;
  title?: React.ReactNode;
  /** Иконка/цвет вкладки: маленький кружок тона слева от имени файла. */
  titleTone?: Tone;
  size?: keyof typeof SIZE;
  /** Метки справа от строки: { 3: <Chip/> }. */
  marks?: Record<number, React.ReactNode>;
  /** Волнистое красное подчёркивание: строка и кусок текста. */
  wavy?: { line: number; text: string };
  className?: string;
  style?: React.CSSProperties;
}

export function CodePanel({
  code,
  lang,
  hl,
  tone = 'accent',
  title,
  titleTone,
  size = 'md',
  marks,
  wavy,
  className,
  style,
}: CodePanelProps) {
  const lines = useMemo(() => highlightWeb(code, lang), [code, lang]);
  const focus = !!hl && hl.length > 0;

  return (
    <div className={cn('overflow-hidden rounded-2xl bg-code-bg shadow-lift ring-1 ring-code-line/10', className)} style={style}>
      {title && (
        <div className="flex items-center gap-4 border-b border-code-line/10 px-5 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-code-line/15" />
            <span className="h-3 w-3 rounded-full bg-code-line/15" />
            <span className="h-3 w-3 rounded-full bg-code-line/15" />
          </span>
          <span className="flex items-center gap-2 font-mono text-[16px] text-code-text/70">
            {titleTone && <span className={cn('h-2.5 w-2.5 rounded-full', TONE[titleTone].bg)} />}
            {title}
          </span>
        </div>
      )}
      <pre className={cn('py-4 font-mono leading-[1.55]', SIZE[size])}>
        {lines.map((tokens, i) => {
          const n = i + 1;
          const on = focus && hl!.includes(n);
          const parts: MarkedToken[] = wavy && wavy.line === n ? splitAt(tokens, wavy.text) : tokens;
          const empty = tokens.length === 0 || (tokens.length === 1 && tokens[0].text === '');
          return (
            <div
              key={i}
              className={cn(
                'relative flex items-center px-6 transition-[opacity,background-color] duration-300',
                on && 'bg-code-line/[0.09]',
                focus && !on && 'opacity-30',
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 w-1.5 transition-opacity duration-300',
                  TONE[tone].bg,
                  on ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span className="shrink-0 whitespace-pre">
                {empty
                  ? ' '
                  : parts.map((t, j) => (
                      <Fragment key={j}>
                        <span
                          className={cn(
                            TOKEN_CLASS[t.kind],
                            t.mark && 'underline decoration-danger decoration-wavy decoration-2 underline-offset-[6px]',
                          )}
                        >
                          {t.text}
                        </span>
                      </Fragment>
                    ))}
              </span>
              {marks?.[n] && <span className="ml-auto shrink-0 pl-4">{marks[n]}</span>}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
