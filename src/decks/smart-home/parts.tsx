'use client';

import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import { highlight, TOKEN_CLASS } from '@/lib/highlight';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { T } from './data';

/** Иконка чайника в стиле lucide (в наборе её нет) — подходит в любой `icon` примитивов. */
const KettleSvg = forwardRef<SVGSVGElement, LucideProps>(function KettleSvg(
  { size = 24, strokeWidth = 2, absoluteStrokeWidth: _abs, className, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M7 9h10l1.4 10.2A1.6 1.6 0 0 1 16.8 21H7.2a1.6 1.6 0 0 1-1.6-1.8L7 9z" />
      <path d="M9 9V7.6A1.6 1.6 0 0 1 10.6 6h2.8A1.6 1.6 0 0 1 15 7.6V9" />
      <path d="M12 6V4.5" />
      <path d="M17.2 11h1.3a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1-2.5 2.5H18" />
      <path d="M6.8 12.5 3.5 10" />
    </svg>
  );
});
export const KettleIcon = KettleSvg as unknown as LucideIcon;

interface MsgProps {
  /** Топик MQTT. */
  topic: string;
  /** Тело сообщения (обычно JSON). */
  payload: string;
  /** Плашки справа в шапке: `QoS 1`, `retain`. */
  flags?: string[];
  /** Подпись слева в шапке: PUBLISH, «команда»… */
  kind?: string;
  tone?: Tone;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Сообщение MQTT: топик сверху, тело снизу. Тёмная панель, как код. */
export function MqttMsg({ topic, payload, flags = [], kind = 'PUBLISH', tone = T.broker, active, className, style }: MsgProps) {
  const lines = highlight(payload, payload.trim().startsWith('{') ? 'json' : 'text');
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-code-bg shadow-lift ring-1 transition-shadow duration-300',
        active ? cn('ring-4', TONE[tone].border, TONE[tone].ring) : 'ring-code-line/10',
        className,
      )}
      style={style}
    >
      <div className="flex items-center gap-3 border-b border-code-line/10 px-5 py-2.5">
        <span className={cn('h-3 w-3 shrink-0 rounded-full', TONE[tone].bg)} />
        <span className="shrink-0 font-mono text-[15px] font-semibold uppercase tracking-wider text-code-comment">{kind}</span>
        <span className="truncate font-mono text-[20px] font-semibold text-code-fn">{topic}</span>
        {flags.length > 0 && (
          <span className="ml-auto flex shrink-0 gap-2">
            {flags.map((f) => (
              <span key={f} className="rounded-md bg-code-line/10 px-2 py-0.5 font-mono text-[15px] text-code-text/80">
                {f}
              </span>
            ))}
          </span>
        )}
      </div>
      <pre className="px-5 py-3 font-mono text-[19px] leading-[1.5]">
        {lines.map((tokens, i) => (
          <div key={i}>
            {tokens.map((t, j) => (
              <span key={j} className={TOKEN_CLASS[t.kind]}>
                {t.text}
              </span>
            ))}
          </div>
        ))}
      </pre>
    </div>
  );
}

/** Нумерованная метка темы: ①②③ на карте. */
export function Badge({ n, tone, className, style }: { n: number; tone: Tone; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={cn('flex h-11 w-11 items-center justify-center rounded-full text-[24px] font-bold text-white shadow-card', TONE[tone].bg, className)}
      style={style}
    >
      {n}
    </span>
  );
}
