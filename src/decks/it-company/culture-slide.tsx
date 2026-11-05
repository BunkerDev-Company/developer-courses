'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp, CircleHelp, Gem, Handshake, Shirt } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';

/**
 * Три слоя культуры (по модели Шейна), как айсберг:
 * 0 — видно сразу, 1 — как принято (неписаные правила), 2 — во что верят (ценности),
 * 3 — как узнать культуру компании до того, как туда устроиться.
 */

interface Layer {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  items: string[];
  /** Ценности — цитатами, не плашками. */
  quotes?: boolean;
  width: number;
  top: number;
  height: number;
  /** Пояснение справа. */
  head: string;
  text: string;
  caption: string;
}

const LAYERS: Layer[] = [
  {
    tone: 'db',
    icon: Shirt,
    title: 'Видно сразу',
    items: ['офис', 'мерч', 'корпоративы', 'печеньки', 'дресс-код'],
    width: 700,
    top: 0,
    height: 120,
    head: 'Витрина',
    text: 'Приятно, но о работе говорит мало. Печеньки есть почти везде.',
    caption: 'Сверху — то, что видно сразу: офис, мерч, корпоративы',
  },
  {
    tone: 'guard',
    icon: Handshake,
    title: 'Как здесь принято',
    items: ['на «ты» с руководителем', 'спорить с лидом — нормально', 'ошибки разбирают, а не наказывают', 'новичкам помогают'],
    width: 760,
    top: 176,
    height: 160,
    head: 'Неписаные правила',
    text: 'Это и есть культура: с этим вы живёте каждый день.',
    caption: 'Под водой — неписаные правила: как здесь принято',
  },
  {
    tone: 'git',
    icon: Gem,
    title: 'Во что верят',
    items: ['пользователь важнее процесса', 'качество важнее скорости', 'людям доверяют'],
    quotes: true,
    width: 860,
    top: 352,
    height: 156,
    head: 'Ценности',
    text: 'Видны по поступкам, а не по плакату на стене.',
    caption: 'В основе — ценности: что здесь важнее всего',
  },
];

const ASK = ['Что было, когда кто-то уронил прод?', 'Кто ревьюит код новичка?', 'Часто ли бывают переработки?', 'Как проходит первая неделя?'];

const LEFT_W = 860;
const WATER_Y = 140;
const RIGHT = { left: 900, width: 540, height: 508 };

export function CultureSlide({ step }: SlideProps) {
  const cur = LAYERS[step];
  return (
    <SlideLayout section="culture" title="Что такое корпоративная культура">
      {/* Линия воды */}
      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
        <line x1={0} y1={WATER_Y} x2={LEFT_W} y2={WATER_Y} className="stroke-db/60" strokeWidth={3} strokeDasharray="14 10" />
      </svg>
      <div className="absolute flex items-center gap-1.5 text-[16px] font-semibold text-muted" style={{ left: 0, top: WATER_Y - 28 }}>
        <ArrowUp size={16} /> видно
      </div>
      <div className="absolute flex items-center gap-1.5 text-[16px] font-semibold text-db" style={{ left: 0, top: WATER_Y + 8 }}>
        <ArrowDown size={16} /> не видно сразу
      </div>

      {LAYERS.map((l, i) => {
        const t = TONE[l.tone];
        return (
          <Reveal key={l.title} show={step >= i} from="up" className="absolute" style={{ left: (LEFT_W - l.width) / 2, top: l.top, width: l.width }}>
            <div
              className={cn('flex flex-col gap-3 rounded-3xl border-2 bg-surface px-6 py-4 shadow-card transition-[border-color,box-shadow] duration-300', i === step ? cn(t.border, t.ring) : t.borderSoft)}
              style={{ height: l.height }}
            >
              <div className={cn('flex items-center gap-3 text-[24px] font-bold', t.text)}>
                <l.icon size={26} />
                {l.title}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {l.items.map((x) =>
                  l.quotes ? (
                    <span key={x} className="text-[24px] font-semibold leading-snug">
                      «{x}»
                    </span>
                  ) : (
                    <Pill key={x} tone={l.tone}>
                      {x}
                    </Pill>
                  ),
                )}
              </div>
            </div>
          </Reveal>
        );
      })}

      {/* Справа: что это значит */}
      <div className="absolute" style={{ left: RIGHT.left, top: 0, width: RIGHT.width, height: RIGHT.height }}>
        <Swap k={step} className="h-full">
          {cur ? (
            <div className={cn('card flex flex-col gap-4 border-l-[8px] p-7', TONE[cur.tone].border)}>
              <div className={cn('text-[34px] font-bold', TONE[cur.tone].text)}>{cur.head}</div>
              <div className="text-[27px] leading-snug">{cur.text}</div>
            </div>
          ) : (
            <div className="card flex h-full flex-col gap-4 border-l-[8px] border-accent p-7">
              <div className="text-[30px] font-bold leading-tight">Спросите на собеседовании</div>
              {ASK.map((q) => (
                <div key={q} className="flex items-start gap-3 text-[24px] leading-snug">
                  <CircleHelp size={26} className="mt-0.5 shrink-0 text-accent" />
                  {q}
                </div>
              ))}
              <div className="mt-auto text-[21px] leading-snug text-text-2">По ответам — и по тому, как отвечают, — всё станет понятно.</div>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption step={step} tone={cur?.tone ?? 'accent'} captions={[...LAYERS.map((l) => l.caption), 'Культуру узнают по вопросам на собеседовании']} />
    </SlideLayout>
  );
}
