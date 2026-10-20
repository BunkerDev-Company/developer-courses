'use client';

import { Search, Tag } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import type { SlideProps } from '@/types';
import { RoleBadge } from '../request/restaurant';

/**
 * Шаги:
 * 0 — метод create() есть, а вызова в нашем коде нет: кто его вызывает?
 * 1 — @ — декоратор: наклейка на класс, метод, параметр. Сам ничего не делает
 * 2 — при старте Nest читает наклейки и строит таблицу маршрутов (реальный лог)
 * 3 — пришёл запрос: Nest находит строку таблицы и сам вызывает create(), подавая аргументы
 */

const CTRL_CODE = `@Controller('items')
export class ItemsController {
  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.commandBus.execute(…);
  }
}`;

const CODE = { left: 0, top: 0, width: 560 };
const LH = 19 * 1.55;
const lineY = (n: number) => CODE.top + 45 + 16 + (n - 0.5) * LH;

const HL = [[4], [1, 3, 5, 6], [1, 3], [4, 5, 6]];

const RIGHT = { left: 640, width: 800 };

/** Наклейки и что они значат. top — верх карточки справа, line — строка кода. */
const STICKERS: { code: string; text: string; line: number; top: number }[] = [
  { code: "@Controller('items')", text: 'на класс: «отвечаю за /items»', line: 1, top: 0 },
  { code: '@Post()', text: 'на метод: «зови меня на POST»', line: 3, top: 128 },
  { code: '@CurrentUserId() · @Body()', text: 'на параметры: «что сюда подать»', line: 5.5, top: 256 },
];
const STICKER_H = 108;

// Вывод `npm run start:dev` etalon-backend; префикс «[Nest] PID - дата, время» обрезан.
const BOOT: TermLine[] = [
  { text: 'npm run start:dev', kind: 'cmd' },
  { text: 'LOG [RoutesResolver] ItemsController {/api/v1/items}:', kind: 'dim' },
  { text: 'LOG [RouterExplorer] Mapped {/api/v1/items, GET} route' },
  { text: 'LOG [RouterExplorer] Mapped {/api/v1/items/:id, GET} route' },
  { text: 'LOG [RouterExplorer] Mapped {/api/v1/items, POST} route', kind: 'ok' },
  { text: 'LOG [RouterExplorer] Mapped {/api/v1/items/:id, PATCH} route' },
  { text: 'LOG [RouterExplorer] Mapped {/api/v1/items/:id, DELETE} route' },
  { text: 'LOG [NestApplication] Nest application successfully started', kind: 'dim' },
];

const CALL_CODE = `// пришёл POST /api/v1/items → по таблице это
// ItemsController.create — Nest вызывает его сам:
controller.create(
  request.userId,   // ← @CurrentUserId()
  request.body,     // ← @Body()
);`;

export function DecoratorsSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="request" title={<>Кто вызывает <M>create()</M>?</>} aside={<RoleBadge role="host" />}>
      <Code
        code={CTRL_CODE}
        lang="ts"
        size="sm"
        title="controllers/items.controller.ts"
        hl={HL[step]}
        tone="ctrl"
        className="absolute"
        style={CODE}
      />

      {/* Шаг 1: стрелки «наклейка → что значит» */}
      {STICKERS.map((s, i) => (
        <Arrow
          key={s.code}
          show={step === 1}
          from={[CODE.left + CODE.width + 8, lineY(s.line)]}
          to={[RIGHT.left - 8, s.top + STICKER_H / 2]}
          tone="ctrl"
          width={3}
          delay={0.2 + i * 0.12}
        />
      ))}

      <div className="absolute" style={{ left: RIGHT.left, top: 0, width: RIGHT.width }}>
        <Swap k={step}>
          {step === 0 && <WhoCalls />}
          {step === 1 && <Stickers />}
          {step === 2 && <Terminal lines={BOOT} title="etalon-backend — старт" style={{ height: 316 }} />}
          {step === 3 && (
            <Code code={CALL_CODE} lang="ts" size="sm" title="внутри Nest — упрощённо" hl={[3, 4, 5, 6]} tone="ctrl" />
          )}
        </Swap>
      </div>

      {/* Под кодом: итог шага 2–3 */}
      <div className="absolute" style={{ left: 0, top: 400, width: 1440 }}>
        <Swap k={step >= 2 ? step : 'none'}>
          {step === 2 && (
            <div className="flex items-center gap-4">
              <Chip tone="ctrl">POST /api/v1/items</Chip>
              <span className="text-[24px] text-muted">→</span>
              <Chip tone="ctrl" solid>
                ItemsController.create()
              </Chip>
              <span className="text-[22px] text-text-2">— одна строка из таблицы маршрутов</span>
            </div>
          )}
          {step === 3 && (
            <div className="flex items-center gap-4 text-[24px]">
              <Chip tone="ctrl">мы: метод + наклейки</Chip>
              <Chip tone="ctrl" solid>
                Nest: когда вызвать и с чем
              </Chip>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="ctrl"
        captions={[
          <>
            Метод <M>create()</M> есть, а вызова в нашем коде нет. Кто же его вызывает?
          </>,
          <>
            <M>@</M> — декоратор: наклейка на класс или метод. Сама ничего не делает
          </>,
          'При старте Nest читает наклейки и составляет таблицу маршрутов',
          <>
            Пришёл запрос — Nest сам вызывает <M>create()</M> и подаёт аргументы
          </>,
        ]}
      />
    </SlideLayout>
  );
}

function WhoCalls() {
  return (
    <div className="flex flex-col gap-5">
      <div className="card flex items-center gap-4 px-6 py-5">
        <Search size={30} className="shrink-0 text-muted" />
        <span className="font-mono text-[22px] font-semibold">controller.create(</span>
        <span className="text-[22px] text-text-2">— поиск по src/</span>
        <Chip tone="danger" className="ml-auto">
          0 совпадений
        </Chip>
      </div>
      <div className="card flex flex-col items-center justify-center gap-3 border-dashed px-6 py-10 text-center">
        <span className="text-[72px] font-extrabold leading-none text-ctrl">?</span>
        <span className="text-[28px] font-semibold">Метод написали — а вызывает его кто?</span>
        <span className="text-[22px] text-text-2">гость не ищет официанта сам — его ведёт хостес</span>
      </div>
    </div>
  );
}

function Stickers() {
  return (
    <div className="relative" style={{ height: 372 }}>
      {STICKERS.map((s) => (
        <div
          key={s.code}
          className="card absolute flex flex-col justify-center gap-2 px-5"
          style={{ top: s.top, left: 0, width: RIGHT.width, height: STICKER_H }}
        >
          <span className="flex items-center gap-3">
            <Tag size={24} className="shrink-0 text-ctrl" />
            <span className="font-mono text-[22px] font-semibold text-ctrl">{s.code}</span>
          </span>
          <span className="pl-9 text-[24px]">наклейка {s.text}</span>
        </div>
      ))}
    </div>
  );
}
