'use client';

import { Package } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE, type RoleKey } from '../it-company/data';
import { Avatar } from '../it-company/parts';

/**
 * Цикл Scrum слева направо:
 * 0 бэклог продукта → 1 планирование → бэклог спринта → 2 спринт с дейли →
 * 3 инкремент → 4 демо и ретро возвращают в бэклог → 5 три роли.
 */

const BACKLOG = [
  { key: 'PROMO-12', title: 'Промокод в корзине' },
  { key: 'SHOP-28', title: 'Фильтр по цене' },
  { key: 'SHOP-31', title: 'Оплата частями' },
  { key: 'SHOP-35', title: 'Тёмная тема' },
];

const BL = { x: 0, y: 0, w: 280, h: 340 };
const SB = { x: 410, y: 40, w: 222, h: 260 };
const SPR = { cx: 830, cy: 170, r: 125 };
const INC = { x: 1070, y: 70, w: 370, h: 200 };
const ROLES_TOP = 418;
const ROLES_H = 128;

type Who = { name: string; role: RoleKey };

const ROLE_CARDS: { title: string; text: string; people: Who[]; tone: Tone; x: number; w: number }[] = [
  { title: 'Product Owner', text: 'продакт: решает, что важнее', people: [PEOPLE.pm], tone: 'ctrl', x: 0, w: 440 },
  {
    title: 'Разработчики',
    text: 'все, кто делает инкремент',
    people: [PEOPLE.dev, PEOPLE.front, PEOPLE.qa, PEOPLE.analyst, PEOPLE.design],
    tone: 'logic',
    x: 470,
    w: 500,
  },
  { title: 'Scrum Master', text: 'следит за процессом; часто — тимлид', people: [PEOPLE.lead], tone: 'git', x: 1000, w: 440 },
];

export function ScrumSlide({ step }: SlideProps) {
  const ring = (s: number, tone: Tone) => (step === s ? cn(TONE[tone].border, TONE[tone].ring) : 'border-border');

  return (
    <SlideLayout section="scrum" title="Scrum: как устроен спринт">
      {/* Бэклог продукта */}
      <div
        className={cn('card absolute flex flex-col gap-2 p-3 transition-[border-color,box-shadow] duration-300', ring(0, 'ctrl'))}
        style={{ left: BL.x, top: BL.y, width: BL.w, height: BL.h }}
      >
        <div className="px-1 text-[23px] font-bold">Бэклог продукта</div>
        {BACKLOG.map((t, i) => (
          <TaskRow key={t.key} k={t.key} title={t.title} hot={i === 0} />
        ))}
        <div className="mt-auto px-1 text-[17px] text-muted">…и ещё 23 задачи</div>
      </div>

      {/* Планирование → бэклог спринта */}
      <Arrow show={step >= 1} from={[BL.w + 6, 150]} to={[SB.x - 6, 150]} tone="ctrl" />
      <Reveal show={step >= 1} className="absolute text-center text-[17px] font-semibold text-ctrl" style={{ left: BL.w, top: 114, width: SB.x - BL.w }}>
        планирование
      </Reveal>
      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: SB.x, top: SB.y, width: SB.w }}>
        <div className={cn('card flex flex-col gap-2 p-3 transition-[border-color,box-shadow] duration-300', ring(1, 'ctrl'))} style={{ height: SB.h }}>
          <div className="px-1 text-[23px] font-bold">Бэклог спринта</div>
          {BACKLOG.slice(0, 3).map((t, i) => (
            <TaskRow key={t.key} k={t.key} title={t.title} hot={i === 0} />
          ))}
        </div>
      </Reveal>

      {/* Спринт */}
      <Arrow show={step >= 2} from={[SB.x + SB.w + 6, 170]} to={[SPR.cx - SPR.r - 8, SPR.cy]} tone="ctrl" />
      <Reveal show={step >= 2} from="scale" className="absolute" style={{ left: SPR.cx - SPR.r, top: SPR.cy - SPR.r, width: SPR.r * 2 }}>
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-full border-[6px] bg-surface shadow-card transition-shadow duration-300',
            TONE.ctrl.border,
            step === 2 && TONE.ctrl.ring,
          )}
          style={{ width: SPR.r * 2, height: SPR.r * 2 }}
        >
          <span className="text-[34px] font-bold">Спринт</span>
          <span className="text-[22px] text-text-2">2 недели</span>
        </div>
      </Reveal>
      <Reveal show={step >= 2} from="scale" delay={0.25} className="absolute" style={{ left: SPR.cx + 48, top: SPR.cy - SPR.r - 36, width: 132 }}>
        <div className="flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full border-4 border-prisma bg-surface shadow-card">
          <span className="text-[21px] font-bold text-prisma">дейли</span>
          <span className="text-[15px] text-text-2">каждый день</span>
        </div>
      </Reveal>

      {/* Инкремент */}
      <Arrow show={step >= 3} from={[SPR.cx + SPR.r + 8, SPR.cy]} to={[INC.x - 6, SPR.cy]} tone="ctrl" />
      <Reveal show={step >= 3} from="left" className="absolute" style={{ left: INC.x, top: INC.y, width: INC.w }}>
        <div className={cn('card flex items-center gap-5 px-6 transition-[border-color,box-shadow] duration-300', ring(3, 'success'))} style={{ height: INC.h }}>
          <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
            <Package size={42} />
          </span>
          <div>
            <div className="text-[30px] font-bold leading-tight">Инкремент</div>
            <div className="mt-1 text-[21px] leading-snug text-text-2">работающая версия: промокоды уже в корзине</div>
          </div>
        </div>
      </Reveal>

      {/* Демо и ретро → снова бэклог */}
      <Arrow
        show={step >= 4}
        from={[INC.x + INC.w / 2, INC.y + INC.h + 8]}
        to={[BL.w / 2, BL.h + 8]}
        curve={-70}
        tone="git"
        label="демо и ретро: новые задачи и улучшения"
        labelOffset={[0, 4]}
      />

      {/* Роли */}
      {ROLE_CARDS.map((r, i) => {
        const t = TONE[r.tone];
        return (
          <Reveal key={r.title} show={step >= 5} from="up" delay={i * 0.12} className="absolute" style={{ left: r.x, top: ROLES_TOP, width: r.w }}>
            <div className={cn('card flex items-center gap-4 border-l-[8px] px-5', t.border)} style={{ height: ROLES_H }}>
              <div className="flex shrink-0 -space-x-2">
                {r.people.map((p) => (
                  <Avatar key={p.name} name={p.name} role={p.role} size={48} className="ring-4 ring-surface" />
                ))}
              </div>
              <div className="min-w-0">
                <div className="text-[27px] font-bold leading-tight">{r.title}</div>
                <div className="text-[20px] leading-snug text-text-2">{r.text}</div>
              </div>
            </div>
          </Reveal>
        );
      })}

      <StepCaption
        step={step}
        tone={step === 3 ? 'success' : step === 4 ? 'git' : 'ctrl'}
        captions={[
          'Бэклог продукта: всё, что хотим сделать, — по важности',
          'Планирование: берём столько, сколько успеем за спринт',
          'Спринт — 2 недели работы, каждый день короткий дейли',
          'В конце — работающий кусок продукта',
          'Демо и ретро дают новые задачи — цикл замыкается',
          null,
        ]}
      />
    </SlideLayout>
  );
}

function TaskRow({ k, title, hot }: { k: string; title: string; hot?: boolean }) {
  return (
    <div className={cn('rounded-lg border-2 px-3 py-1.5', hot ? cn(TONE.accent.borderSoft, TONE.accent.soft) : 'border-border bg-surface-2')}>
      <div className={cn('font-mono text-[15px] leading-tight', hot ? 'text-accent' : 'text-muted')}>{k}</div>
      <div className="truncate text-[19px] font-semibold leading-tight">{title}</div>
    </div>
  );
}
