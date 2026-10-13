'use client';

import type { LucideIcon } from 'lucide-react';
import { Braces, Cookie, Globe, KeyRound, Link2, Signpost } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { HTTP_REQUEST, REQ } from './data';

/**
 * Шаги:
 * 0 — вызов itemsApi.create(...) на фронте → axios → сырой HTTP-запрос
 * 1 — метод + путь: КУДА (роутинг)
 * 2 — Authorization: КТО (guards)
 * 3 — тело JSON: ЧТО (DTO → команда)
 */

const FRONT_CALL = `itemsApi.create({ title: '${REQ.body.title}', price: ${REQ.body.price} });`;

// Панель HTTP-запроса: размер lg (26px, строка 26 × 1.55).
const HTTP = { left: 0, top: 196, width: 780 };
const LINE_H = 26 * 1.55;
const lineY = (n: number) => HTTP.top + 45 + 16 + (n - 1) * LINE_H + LINE_H / 2;

interface Part {
  step: number;
  line: number;
  tone: Tone;
  icon: LucideIcon;
  word: string;
  text: React.ReactNode;
  cy: number;
}

const PARTS: Part[] = [
  { step: 1, line: 1, tone: 'ctrl', icon: Signpost, word: 'Куда', text: 'метод + путь → роутинг', cy: 262 },
  { step: 2, line: 3, tone: 'guard', icon: KeyRound, word: 'Кто', text: 'токен → guards', cy: 370 },
  { step: 3, line: 6, tone: 'logic', icon: Braces, word: 'Что', text: 'тело → DTO → команда', cy: 478 },
];

const CARD = { left: 850, width: 590, height: 84 };

export function HttpSlide({ step }: SlideProps) {
  const current = PARTS.find((p) => p.step === step);

  return (
    <SlideLayout section="request" title="Что прилетает на бэкенд">
      {/* Фронт: вызов из компонента формы */}
      <NodeBox
        tone="client"
        icon={Globe}
        title="Фронтенд"
        sub="Next.js"
        state={step === 0 ? 'active' : 'idle'}
        className="absolute"
        style={{ left: 0, top: 10, width: 250 }}
      />
      <Code
        code={FRONT_CALL}
        lang="ts"
        size="md"
        title="components/items/item-form-modal.tsx"
        className="absolute"
        style={{ left: 290, top: 0, width: 740 }}
      />

      {/* Что axios добавляет сам (lib/api.ts) */}
      <Reveal show delay={0.25} from="left" className="absolute" style={{ left: 1070, top: 0, width: 370 }}>
        <div className="card px-5 py-3">
          <div className="mb-2 text-[16px] font-semibold uppercase tracking-wider text-muted">axios добавит сам</div>
          <div className="flex flex-col gap-2 font-mono text-[19px]">
            <span className="flex items-center gap-2.5">
              <Link2 size={20} className="text-client" />
              baseURL <span className="text-text-2">…/api/v1</span>
            </span>
            <span className="flex items-center gap-2.5">
              <Cookie size={20} className="text-client" />
              Bearer <span className="text-text-2">← cookie</span>
            </span>
          </div>
        </div>
      </Reveal>

      <Arrow from={[640, 118]} to={[640, HTTP.top - 8]} tone="client" label="axios" flow={step === 0} delay={0.3} />

      {/* Сырой HTTP-запрос — просто текст */}
      <Reveal show delay={0.55} from="up" className="absolute" style={{ left: HTTP.left, top: HTTP.top, width: HTTP.width }}>
        <Code
          code={HTTP_REQUEST}
          lang="http"
          size="lg"
          title="HTTP-запрос — обычный текст"
          hl={current ? [current.line] : undefined}
          tone={current?.tone ?? 'accent'}
        />
      </Reveal>

      {/* Подписи: куда / кто / что */}
      {PARTS.map((p) => {
        const t = TONE[p.tone];
        const on = p.step === step;
        return (
          <div key={p.word}>
            <Arrow
              show={step >= p.step}
              from={[HTTP.left + HTTP.width + 8, lineY(p.line)]}
              to={[CARD.left - 8, p.cy]}
              tone={on ? p.tone : 'muted'}
              width={3}
            />
            <Reveal
              show={step >= p.step}
              from="left"
              className="absolute"
              style={{ left: CARD.left, top: p.cy - CARD.height / 2, width: CARD.width }}
            >
              <div
                className={cn(
                  'card flex items-center gap-5 px-5 transition-[border-color,box-shadow,opacity] duration-300',
                  on ? cn(t.border, t.ring) : 'opacity-60',
                )}
                style={{ height: CARD.height }}
              >
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                  <p.icon size={28} />
                </div>
                <div className={cn('w-[96px] shrink-0 text-[30px] font-bold uppercase tracking-wide', t.text)}>{p.word}</div>
                <div className="text-[25px] font-medium text-text-2">{p.text}</div>
              </div>
            </Reveal>
          </div>
        );
      })}

      <StepCaption
        step={step}
        tone={current?.tone ?? 'client'}
        captions={[
          <>
            Вызов <M>itemsApi.create(…)</M> axios превращает в текст — HTTP-запрос
          </>,
          <>
            Метод + путь — <b>куда</b>: по ним Nest найдёт метод контроллера
          </>,
          <>
            <M>Authorization</M> — <b>кто</b>: токен проверят guards
          </>,
          <>
            Тело JSON — <b>что</b>: станет DTO, а потом командой
          </>,
        ]}
      />
    </SlideLayout>
  );
}
