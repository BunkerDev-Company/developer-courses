'use client';

import type { LucideIcon } from 'lucide-react';
import {
  AlarmClock,
  ArrowRight,
  Calculator,
  CreditCard,
  Database,
  KeyRound,
  Mail,
  MessageSquare,
  Plug,
  Scale,
  Server,
  Table2,
  UserCheck,
  X,
} from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from './parts';

/** Шаги 0–5: по одной работе бэкенда на шаг, вокруг «хаба». */

interface Job {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  /** Мини-пример из магазина. */
  example: React.ReactNode;
  caption: string;
}

const JOBS: Job[] = [
  {
    icon: Database,
    tone: 'db',
    title: 'Хранит данные',
    example: (
      <>
        <Chip tone="db" icon={Table2}>Item</Chip>
        <Chip tone="db" icon={Table2}>User</Chip>
        <Chip tone="db" icon={Table2}>Order</Chip>
      </>
    ),
    caption: 'Хранит данные — товары, пользователей, заказы',
  },
  {
    icon: KeyRound,
    tone: 'guard',
    title: 'Проверяет, кто ты',
    example: (
      <>
        <Chip tone="guard">Bearer eyJhbGci…</Chip>
        <ArrowRight size={24} className="text-muted" />
        <Pill tone="success" icon={UserCheck}>это Вася</Pill>
      </>
    ),
    caption: 'Проверяет, кто ты: после входа у тебя есть токен',
  },
  {
    icon: Scale,
    tone: 'warning',
    title: 'Следит за правилами',
    example: (
      <>
        <span className="text-[22px] text-text-2">
          хочу <b className="text-text">5</b> · на складе <b className="text-text">3</b>
        </span>
        <ArrowRight size={24} className="text-muted" />
        <Pill tone="danger" icon={X}>нельзя</Pill>
      </>
    ),
    caption: 'Следит за правилами: нельзя купить больше, чем есть',
  },
  {
    icon: Calculator,
    tone: 'logic',
    title: 'Считает',
    example: (
      <>
        <span className="font-mono text-[22px] text-text-2">2 × 1990 − 10%</span>
        <ArrowRight size={24} className="text-muted" />
        <Pill tone="success">3 582 ₽</Pill>
      </>
    ),
    caption: 'Считает: сумму заказа, скидки, доставку',
  },
  {
    icon: Plug,
    tone: 'ctrl',
    title: 'Общается с сервисами',
    example: (
      <>
        <Pill tone="ctrl" icon={CreditCard}>оплата</Pill>
        <Pill tone="ctrl" icon={Mail}>почта</Pill>
        <Pill tone="ctrl" icon={MessageSquare}>СМС</Pill>
      </>
    ),
    caption: 'Общается с другими сервисами: оплата, почта, СМС',
  },
  {
    icon: AlarmClock,
    tone: 'git',
    title: 'Работает по расписанию',
    example: (
      <>
        <Pill tone="git" icon={AlarmClock}>каждую ночь</Pill>
        <ArrowRight size={24} className="text-muted" />
        <span className="text-[21px] text-text-2">«Вы забыли корзину»</span>
      </>
    ),
    caption: 'Работает по расписанию — даже когда сайт никто не открыл',
  },
];

const CARD_W = 540;
const CARD_H = 166;
const ROW_TOP = [0, 190, 380];
const HUB = { x: 720, y: 262, r: 76 };

function cardPos(i: number) {
  const left = i < 3 ? 0 : 1440 - CARD_W;
  const top = ROW_TOP[i % 3];
  return { left, top, cy: top + CARD_H / 2 };
}

export function JobsSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="backend" title="Что делает бэкенд">
      {/* Хаб */}
      <div className="absolute flex flex-col items-center" style={{ left: HUB.x - 120, top: HUB.y - HUB.r, width: 240 }}>
        <div
          className="flex items-center justify-center rounded-full border-2 border-logic bg-surface text-logic shadow-[0_0_0_10px_rgb(var(--c-logic)/0.12)]"
          style={{ width: HUB.r * 2, height: HUB.r * 2 }}
        >
          <Server size={72} strokeWidth={1.6} />
        </div>
        <div className="mt-4 text-[32px] font-extrabold text-logic">Бэкенд</div>
      </div>

      {JOBS.map((job, i) => {
        const p = cardPos(i);
        const left = i < 3;
        const current = i === step;
        const t = TONE[job.tone];
        // Линия от круга хаба к ближнему краю карточки.
        const dy = (p.cy - HUB.y) * 0.45;
        const from: [number, number] = [left ? HUB.x - HUB.r - 6 : HUB.x + HUB.r + 6, HUB.y + dy];
        const to: [number, number] = [left ? CARD_W + 8 : 1440 - CARD_W - 8, p.cy];
        return (
          <div key={job.title}>
            <Arrow show={step >= i} from={from} to={to} tone={current ? job.tone : 'muted'} flow={current} width={3} />
            <Reveal show={step >= i} from={left ? 'right' : 'left'} className="absolute" style={{ left: p.left, top: p.top, width: CARD_W }}>
              <div
                className={cn(
                  'card flex flex-col gap-4 p-5 transition-[border-color,box-shadow] duration-300',
                  current && cn(t.border, t.ring),
                )}
                style={{ height: CARD_H }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                    <job.icon size={30} />
                  </div>
                  <span className="text-[28px] font-bold leading-tight">{job.title}</span>
                  <span className="ml-auto text-[20px] font-bold text-muted">0{i + 1}</span>
                </div>
                <div className="flex items-center gap-3">{job.example}</div>
              </div>
            </Reveal>
          </div>
        );
      })}

      <StepCaption step={step} tone="logic" captions={JOBS.map((j) => j.caption)} />
    </SlideLayout>
  );
}
