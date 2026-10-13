'use client';

import { Flame, ShoppingCart } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги: 0 — 2xx (всё хорошо), 1 — 4xx (ошибка клиента), 2 — 5xx (ошибка сервера).
 * Аналогия — ресторан, пример — наш магазин. Коды — из etalon-backend (app-errors.ts).
 */

interface Status {
  code: number;
  name: string;
  /** Как это звучало бы в ресторане. */
  analogy: string;
  /** Когда так отвечает наш магазин. */
  shop: string;
}

interface Group {
  range: string;
  label: string;
  tone: Tone;
  left: number;
  items: Status[];
}

const GROUPS: Group[] = [
  {
    range: '2xx',
    label: 'всё хорошо',
    tone: 'success',
    left: 0,
    items: [
      { code: 200, name: 'OK', analogy: '«Вот ваше блюдо»', shop: 'список товаров получен' },
      { code: 201, name: 'Created', analogy: '«Заказ принят, готовим»', shop: 'заказ создан' },
    ],
  },
  {
    range: '4xx',
    label: 'ошибка клиента',
    tone: 'warning',
    left: 380,
    items: [
      { code: 400, name: 'Bad Request', analogy: '«Заказ записан с ошибкой»', shop: 'в форме количество: −2' },
      { code: 401, name: 'Unauthorized', analogy: '«Вы кто?»', shop: 'не вошёл — нет токена' },
      { code: 403, name: 'Forbidden', analogy: '«На кухню гостям нельзя»', shop: 'удаление — только админ' },
      { code: 404, name: 'Not Found', analogy: '«Такого блюда нет в меню»', shop: 'товара с таким id нет' },
    ],
  },
];

const CARD_W = 330;
const CARD_H = 222;
const ROW_Y = [62, 302];

export function StatusSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="web" title="Код ответа: всё ли в порядке">
      {GROUPS.map((g, gi) => (
        <Reveal key={g.range} show={step >= gi} from="up" className="absolute" style={{ left: g.left, top: 0 }}>
          <GroupHeader range={g.range} label={g.label} tone={g.tone} />
        </Reveal>
      ))}

      {/* 2xx — столбиком */}
      {GROUPS[0].items.map((s, i) => (
        <Reveal key={s.code} show={step >= 0} delay={i * 0.12} className="absolute" style={{ left: 0, top: ROW_Y[i], width: CARD_W + 10 }}>
          <StatusCard status={s} tone="success" active={step === 0} />
        </Reveal>
      ))}

      {/* 4xx — сеткой 2×2 */}
      {GROUPS[1].items.map((s, i) => (
        <Reveal
          key={s.code}
          show={step >= 1}
          delay={i * 0.12}
          className="absolute"
          style={{ left: 380 + (i % 2) * (CARD_W + 20), top: ROW_Y[Math.floor(i / 2)], width: CARD_W }}
        >
          <StatusCard status={s} tone="warning" active={step === 1} />
        </Reveal>
      ))}

      {/* 5xx — одна большая карточка */}
      <Reveal show={step >= 2} from="up" className="absolute" style={{ left: 1100, top: 0 }}>
        <GroupHeader range="5xx" label="ошибка сервера" tone="danger" />
      </Reveal>
      <Reveal show={step >= 2} from="scale" delay={0.1} className="absolute" style={{ left: 1100, top: ROW_Y[0], width: 340 }}>
        <div
          className={cn(
            'card flex flex-col p-6 transition-[border-color,box-shadow] duration-300',
            step === 2 && cn(TONE.danger.border, TONE.danger.ring),
          )}
          style={{ height: ROW_Y[1] - ROW_Y[0] + CARD_H }}
        >
          <CodeLine code={500} name="Internal Server Error" tone="danger" />
          <div className="mt-3 text-[24px] font-semibold leading-snug">«На кухне что-то сгорело»</div>
          <ShopLine text="ошибка в коде сервера" />
          <div className="mt-auto flex flex-col items-center gap-3 rounded-2xl bg-danger/10 p-5 text-center">
            <Flame size={56} className="text-danger" />
            <div className="text-[20px] font-semibold leading-snug text-text-2">
              пользователь ни при чём — чинит разработчик бэкенда
            </div>
          </div>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 0 ? 'success' : step === 1 ? 'warning' : 'danger'}
        captions={[
          'Статус 2xx — всё прошло хорошо',
          '4xx — ошибка в запросе: виноват тот, кто спрашивает',
          '5xx — ошибка на сервере: виновата «кухня»',
        ]}
      />
    </SlideLayout>
  );
}

function GroupHeader({ range, label, tone }: { range: string; label: string; tone: Tone }) {
  const t = TONE[tone];
  return (
    <div className="flex items-baseline gap-3 whitespace-nowrap">
      <span className={cn('font-mono text-[34px] font-bold', t.text)}>{range}</span>
      <span className="text-[24px] font-semibold text-text-2">{label}</span>
    </div>
  );
}

function CodeLine({ code, name, tone }: { code: number; name: string; tone: Tone }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
      <span className={cn('font-mono text-[42px] font-bold leading-none', TONE[tone].text)}>{code}</span>
      <span className="whitespace-nowrap font-mono text-[17px] text-text-2">{name}</span>
    </div>
  );
}

function ShopLine({ text }: { text: string }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-[19px] text-text-2">
      <ShoppingCart size={20} className="shrink-0 text-muted" />
      {text}
    </div>
  );
}

function StatusCard({ status, tone, active }: { status: Status; tone: Tone; active: boolean }) {
  const t = TONE[tone];
  return (
    <div
      className={cn('card flex flex-col p-5 transition-[border-color,box-shadow] duration-300', active && cn(t.border, t.ring))}
      style={{ height: CARD_H }}
    >
      <CodeLine code={status.code} name={status.name} tone={tone} />
      <div className="mt-3 text-[24px] font-semibold leading-snug">{status.analogy}</div>
      <div className="mt-auto">
        <ShopLine text={status.shop} />
      </div>
    </div>
  );
}
