'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE, SPRING } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { REQ } from './data';

/**
 * Шаги:
 * 0 — URL разбит на куски: /api/v1 ↔ app.setGlobalPrefix('api/v1') в main.ts
 * 1 — /items ↔ @Controller('items')
 * 2 — POST ↔ @Post() → метод create()
 * 3 — второй пример: GET /api/v1/items/3f2a… ↔ @Get(':id') + @Param('id', ParseUUIDPipe)
 */

const MAIN_CODE = `const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.setGlobalPrefix('api/v1', { exclude: ['/'] });`;

const CTRL_CODE = `@Controller('items')
export class ItemsController {
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string, …) { … }
  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateItemDto) { … }
}`;

// Геометрия кода (size sm: 19px, строка 19 × 1.55).
const CODE_X = 500;
const MAIN_TOP = 110;
const CTRL_TOP = 272;
const LH = 19 * 1.55;
const codeLineY = (top: number, n: number) => top + 45 + 16 + (n - 1) * LH + LH / 2;

// Куски URL: моно 30px, ширина символа ≈ 18px.
const CHIP_H = 54;
const BAR_H = 82;
const BAR_CY = BAR_H / 2;
const SLOT_X = 16;

interface Piece {
  key: string;
  text: string;
  w: number;
  /** x внутри строки запроса. */
  barX: number;
  /** y центра «слота» слева от кода — на уровне своей строки кода. */
  slotY: number;
  extracted: boolean;
}

function piecesFor(step: number): Piece[] {
  const get = step === 3;
  const list: Piece[] = [
    { key: 'method', text: get ? 'GET' : 'POST', w: 104, barX: 14, slotY: get ? 416 : 470, extracted: step >= 2 },
    { key: 'prefix', text: '/api/v1', w: 158, barX: 132, slotY: codeLineY(MAIN_TOP, 2), extracted: true },
    { key: 'ctrl', text: '/items', w: 140, barX: 292, slotY: codeLineY(CTRL_TOP, 1), extracted: step >= 1 },
  ];
  if (get) list.push({ key: 'param', text: `/${REQ.itemId}`, w: 232, barX: 434, slotY: 488, extracted: true });
  return list;
}

export function RoutingSlide({ step }: SlideProps) {
  const pieces = piecesFor(step);
  const t = TONE.ctrl;
  const barW = step === 3 ? 680 : 446;
  // Шаг 0: контроллер ещё не при делах — все строки приглушены (hl по несуществующей строке).
  const ctrlHl = step === 1 ? [1] : step === 2 ? [1, 5, 6] : step === 3 ? [1, 3, 4] : [0];
  const slot = (key: string) => pieces.find((p) => p.key === key);

  return (
    <SlideLayout section="request" title="Как Nest находит метод">
      {/* Строка запроса: рамка + «призраки» кусков (видны, когда кусок улетел) */}
      <motion.div
        className="card absolute left-0 top-0"
        initial={false}
        animate={{ width: barW }}
        transition={{ duration: 0.45, ease: EASE }}
        style={{ height: BAR_H }}
      />
      {pieces.map((p) => (
        <div
          key={`ghost-${p.key}`}
          className="absolute flex items-center justify-center font-mono text-[30px] font-semibold leading-none text-muted/60"
          style={{ left: p.barX, top: BAR_CY - CHIP_H / 2, width: p.w, height: CHIP_H }}
        >
          {p.text}
        </div>
      ))}

      {/* Куски URL: из строки улетают к своему месту в коде */}
      {pieces.map((p) => (
        <motion.div
          key={p.key}
          className={cn(
            'absolute left-0 top-0 z-10 flex items-center justify-center rounded-xl border-2 bg-surface font-mono text-[30px] font-semibold leading-none transition-colors duration-300',
            p.extracted ? cn(t.border, t.text, 'shadow-card') : 'border-transparent text-text',
          )}
          style={{ width: p.w, height: CHIP_H }}
          initial={{ x: p.barX, y: BAR_CY - CHIP_H / 2 }}
          animate={p.extracted ? { x: SLOT_X, y: p.slotY - CHIP_H / 2 } : { x: p.barX, y: BAR_CY - CHIP_H / 2 }}
          transition={{ ...SPRING, delay: p.extracted ? 0.2 : 0 }}
        >
          <Swap k={p.text}>{p.text}</Swap>
        </motion.div>
      ))}

      {/* Итог поиска */}
      <div className="absolute flex items-center" style={{ left: 760, top: 9, width: 680, height: 64 }}>
        <Swap k={step < 2 ? 'search' : step}>
          {step < 2 ? (
            <span className="flex items-center gap-3 text-[24px] font-medium text-muted">
              <Search size={28} /> Nest ищет: какой метод вызвать?
            </span>
          ) : (
            <span className="flex items-center gap-3 text-[26px] font-semibold text-success">
              <ArrowRight size={30} strokeWidth={2.5} />
              <span className="chip border-success/40 bg-success/10 text-[26px] text-success">
                {step === 2 ? 'ItemsController.create()' : 'ItemsController.get(id)'}
              </span>
            </span>
          )}
        </Swap>
      </div>

      {/* Код: main.ts и контроллер */}
      <Code
        code={MAIN_CODE}
        lang="ts"
        size="sm"
        title="src/main.ts"
        hl={[2]}
        tone="ctrl"
        className="absolute"
        style={{ left: CODE_X, top: MAIN_TOP, width: 940 }}
      />
      <Code
        code={CTRL_CODE}
        lang="ts"
        size="sm"
        title="src/controllers/items.controller.ts"
        hl={ctrlHl}
        tone="ctrl"
        className="absolute"
        style={{ left: CODE_X, top: CTRL_TOP, width: 940 }}
      />

      {/* Связи «кусок URL ↔ строка кода» */}
      <Arrow
        from={[SLOT_X + 158 + 10, slot('prefix')!.slotY]}
        to={[CODE_X - 8, codeLineY(MAIN_TOP, 2)]}
        tone="ctrl"
        delay={0.6}
        width={3}
      />
      <Arrow
        show={step >= 1}
        from={[SLOT_X + 140 + 10, codeLineY(CTRL_TOP, 1)]}
        to={[CODE_X - 8, codeLineY(CTRL_TOP, 1)]}
        tone="ctrl"
        delay={0.6}
        width={3}
      />
      <Arrow
        show={step === 2}
        from={[SLOT_X + 104 + 10, 470]}
        to={[CODE_X - 8, codeLineY(CTRL_TOP, 5)]}
        tone="ctrl"
        delay={0.6}
        width={3}
      />
      <Arrow
        show={step === 3}
        from={[SLOT_X + 104 + 10, 416]}
        to={[CODE_X - 8, codeLineY(CTRL_TOP, 3)]}
        tone="ctrl"
        delay={0.6}
        width={3}
      />
      <Arrow
        show={step === 3}
        from={[SLOT_X + 232 + 10, 488]}
        to={[CODE_X - 8, codeLineY(CTRL_TOP, 4)]}
        tone="ctrl"
        delay={0.7}
        width={3}
      />

      <Reveal show={step === 3} delay={0.8} className="absolute" style={{ left: SLOT_X, top: 524, width: 470 }}>
        <span className="text-[18px] font-medium text-text-2">
          <M>ParseUUIDPipe</M>: не UUID → сразу 400
        </span>
      </Reveal>

      <StepCaption
        step={step}
        tone="ctrl"
        captions={[
          <>
            <M>/api/v1</M> — общий префикс всего API, задан в main.ts
          </>,
          <>
            <M>/items</M> — выбирает класс-контроллер
          </>,
          <>
            Метод <M>POST</M> → <M>@Post()</M> → вызвать <M>create()</M>
          </>,
          <>
            <M>GET …/items/3f2a…</M> → <M>{"@Get(':id')"}</M>, хвост пути → <M>id</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
