'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Hash } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { CHAT, ROLES, TERM_GROUPS, TERMS, type ChatPart, type RoleKey, type TermKey } from './data';

/** Кружок-аватар цвета роли с первой буквой имени («Вы» — целиком). */
export function Avatar({ name, role, size = 46, className }: { name: string; role: RoleKey; size?: number; className?: string }) {
  const t = TONE[ROLES[role].tone];
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full font-bold text-white', t.bg, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * (name.length <= 2 ? 0.38 : 0.44)) }}
    >
      {name.length <= 2 ? name : name[0]}
    </span>
  );
}

/** Квадрат с иконкой роли — для карточек. */
export function RoleIcon({ role, size = 56, className }: { role: RoleKey; size?: number; className?: string }) {
  const r = ROLES[role];
  const t = TONE[r.tone];
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-2xl', t.soft, t.text, className)} style={{ width: size, height: size }}>
      <r.icon size={Math.round(size * 0.54)} />
    </span>
  );
}

interface ChatWindowProps {
  channel: string;
  /** Канал — решётка, личка — `AtSign`. */
  icon?: LucideIcon;
  /** Справа в шапке: «8 участников». */
  aside?: React.ReactNode;
  active?: boolean;
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Окно рабочего мессенджера: шапка с каналом и лента сообщений. */
export function ChatWindow({ channel, icon: Icon = Hash, aside, active, tone = 'accent', className, style, children }: ChatWindowProps) {
  const t = TONE[tone];
  return (
    <div
      style={style}
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border-2 bg-surface shadow-card transition-[border-color,box-shadow] duration-300',
        active ? cn(t.border, t.ring) : 'border-border',
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b-2 border-border bg-surface-2 px-5 py-3">
        <Icon size={22} className="text-muted" />
        <span className="text-[21px] font-bold">{channel}</span>
        {aside && <span className="ml-auto text-[17px] text-text-2">{aside}</span>}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col gap-4 px-5 py-4">{children}</div>
    </div>
  );
}

interface ChatLineProps {
  who: string;
  role: RoleKey;
  time: string;
  className?: string;
  children: React.ReactNode;
}

/** Одно сообщение в чате: аватар, имя, роль, время, текст. */
export function ChatLine({ who, role, time, className, children }: ChatLineProps) {
  const r = ROLES[role];
  return (
    <div className={cn('flex gap-3.5', className)}>
      <Avatar name={who} role={role} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2.5 leading-tight">
          <span className="text-[19px] font-bold">{who}</span>
          <span className={cn('text-[16px] font-semibold', TONE[r.tone].text)}>{r.tag}</span>
          <span className="text-[15px] text-muted">{time}</span>
        </div>
        <div className="mt-0.5 text-[21px] leading-snug">{children}</div>
      </div>
    </div>
  );
}

/** Какие термины подсвечены: никакие, все или выбранные (остальные — подчёркнуты). */
export type TermMark = 'none' | 'all' | readonly TermKey[];

function Part({ part, mark }: { part: ChatPart; mark: TermMark }) {
  if (typeof part === 'string') return <>{part}</>;
  const t = TONE[TERM_GROUPS[TERMS[part.term].group].tone];
  const on = mark === 'all' || (Array.isArray(mark) && mark.includes(part.term));
  const quiet = Array.isArray(mark) && !on;
  return (
    <span
      className={cn(
        'rounded-md px-1 transition-colors duration-300',
        on && cn(t.soft, t.text, 'font-bold'),
        quiet && 'underline decoration-border-2 decoration-2 underline-offset-4',
      )}
    >
      {part.text}
    </span>
  );
}

/** Чат команды «Корзина» в первый день стажёра. Сообщения появляются по очереди при открытии слайда. */
export function TeamChat({ mark = 'none', className, style }: { mark?: TermMark; className?: string; style?: React.CSSProperties }) {
  return (
    <ChatWindow channel="team-cart" aside="9 участников" className={className} style={style}>
      {CHAT.map((m, i) => (
        <Reveal key={m.time} delay={0.15 + i * 0.18}>
          <ChatLine who={m.who} role={m.role} time={m.time}>
            {m.parts.map((p, j) => (
              <Part key={j} part={p} mark={mark} />
            ))}
          </ChatLine>
        </Reveal>
      ))}
    </ChatWindow>
  );
}

type Pt = readonly [number, number];

/** Линия оргсхемы «уголком»: вниз от родителя, вбок, вниз к ребёнку. Без наконечника. */
export function Elbow({ from, to, show = true, tone = 'muted', delay = 0, width = 3 }: { from: Pt; to: Pt; show?: boolean; tone?: Tone; delay?: number; width?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const my = Math.round((y1 + y2) / 2);
  return (
    <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
      <motion.path
        d={`M ${x1} ${y1} V ${my} H ${x2} V ${y2}`}
        fill="none"
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(TONE[tone].stroke, 'transition-[stroke] duration-300')}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={show ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: show ? delay : 0, ease: EASE }}
      />
    </svg>
  );
}
