'use client';

import { motion } from 'framer-motion';
import { Ban, Bell, Boxes, Database, TriangleAlert } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги:
 * 0 — конструктор CreateItemHandler: три параметра, new нигде нет; слева контейнер Nest
 * 1 — Nest читает типы параметров и ищет их в контейнере
 * 2 — подставляет готовые экземпляры (new делает Nest)
 * 3 — один PrismaService на всё приложение; в тестах — фейк
 */

const CODE = `@CommandHandler(CreateItemCommand)
export class CreateItemHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errors: ErrorService,
    private readonly notifications: NotificationService,
  ) {}

  async execute(command: CreateItemCommand) {
    const item = await this.prisma.item.create({ … });
  }
}`;

// Геометрия панели кода (Code size="sm": 19px, line-height 1.55, шапка 45px, py-4).
const CODE_LEFT = 620;
const CODE_W = 820;
const LINE_H = 19 * 1.55;
const CHAR_W = 19 * 0.6;
const lineY = (n: number) => 45 + 16 + (n - 0.5) * LINE_H;
const colX = (c: number) => CODE_LEFT + 24 + c * CHAR_W;

// Три зависимости: строка в коде, колонка начала типа, где лежит экземпляр в контейнере.
const DEPS: { type: string; tone: Tone; icon: typeof Database; sub: string; line: number; col: number; top: number }[] = [
  { type: 'PrismaService', tone: 'prisma', icon: Database, sub: 'infrastructure/prisma', line: 4, col: 29, top: 96 },
  { type: 'ErrorService', tone: 'danger', icon: TriangleAlert, sub: 'common/services', line: 5, col: 29, top: 196 },
  { type: 'NotificationService', tone: 'muted', icon: Bell, sub: 'infrastructure/notifications', line: 6, col: 36, top: 296 },
];
const BOX_LEFT = 24;
const BOX_W = 400;
const BOX_CY = 38; // центр NodeBox sm относительно его верха

const OTHERS = ['CreateItemHandler', 'UpdateItemHandler', 'ListItemsHandler', 'GetMeHandler', 'JwtAuthGuard', 'RolesGuard'];
const USES_PRISMA = new Set(['CreateItemHandler', 'UpdateItemHandler', 'ListItemsHandler', 'GetMeHandler']);

export function DiSlide({ step }: SlideProps) {
  const reading = step === 1;
  const injected = step >= 2;

  return (
    <SlideLayout section="request" title={<>DI: откуда у хендлера <M>prisma</M></>}>
      {/* ── Контейнер Nest ───────────────────────────────────────── */}
      <div
        className="absolute rounded-3xl border-2 border-dashed border-border-2 bg-surface/50"
        style={{ left: 0, top: 0, width: 450, height: 556 }}
      />
      <div className="absolute flex items-center gap-3" style={{ left: 24, top: 18 }}>
        <Boxes size={30} className="text-logic" />
        <div>
          <div className="text-[26px] font-bold leading-tight">Контейнер Nest</div>
          <div className="text-[17px] text-text-2">
            готовые объекты из <span className="font-mono">providers</span>
          </div>
        </div>
      </div>

      {DEPS.map((d) => {
        const single = step === 3 && d.type === 'PrismaService';
        return (
          <div key={d.type} className="absolute" style={{ left: BOX_LEFT, top: d.top, width: BOX_W }}>
            <NodeBox
              tone={d.tone}
              icon={d.icon}
              size="sm"
              title={<span className="font-mono">{d.type}</span>}
              sub={
                <Swap k={single ? 'one' : 'path'}>
                  {single ? '1 объект = 1 пул к PostgreSQL' : d.sub}
                </Swap>
              }
              state={
                step === 1 ? 'active' : step === 2 ? 'done' : step === 3 ? (single ? 'active' : 'dim') : 'idle'
              }
            />
            <motion.div
              className="absolute -right-4 -top-5"
              initial={false}
              animate={{ opacity: single ? 1 : 0, scale: single ? 1 : 0.6 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <Chip tone="prisma" solid>
                ×1
              </Chip>
            </motion.div>
          </div>
        );
      })}

      {/* Остальные провайдеры — мелко */}
      <div className="absolute" style={{ left: 24, top: 396, width: BOX_W }}>
        <Swap k={step === 3 ? 'same' : 'more'}>
          <div className={cn('text-[17px] font-semibold', step === 3 ? 'text-prisma' : 'text-text-2')}>
            {step === 3 ? 'тот же prisma получают и они:' : 'ещё в providers:'}
          </div>
        </Swap>
        <div className="mt-2 flex flex-wrap gap-2">
          {OTHERS.map((name) => {
            const hl =
              (step === 2 && name === 'CreateItemHandler') || (step === 3 && USES_PRISMA.has(name));
            const tone: Tone = step === 3 ? 'prisma' : 'logic';
            return (
              <motion.span
                key={name}
                initial={false}
                animate={{ opacity: hl ? 1 : 0.55 }}
                className={cn(
                  'chip rounded-lg px-2 py-0.5 text-[15px] transition-colors duration-300',
                  hl ? cn(TONE[tone].soft, TONE[tone].border, TONE[tone].text) : 'border-border bg-surface-2 text-text-2',
                )}
              >
                {name}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* ── Код хендлера ─────────────────────────────────────────── */}
      <Code
        code={CODE}
        lang="ts"
        size="sm"
        title="application/handlers/item-commands.handler.ts"
        hl={step === 0 ? [3, 4, 5, 6, 7] : step === 3 ? [4, 10] : [4, 5, 6]}
        tone={step === 3 ? 'prisma' : 'logic'}
        className="absolute"
        style={{ left: CODE_LEFT, top: 0, width: CODE_W }}
      />

      {/* Рамки вокруг типов: «Nest читает тип» */}
      {DEPS.map((d) => {
        const on = step === 1 || step === 2;
        return (
          <motion.div
            key={d.type}
            className={cn('pointer-events-none absolute rounded-md border-2', TONE[d.tone].border)}
            style={{
              left: colX(d.col) - 5,
              top: lineY(d.line) - 15,
              width: d.type.length * CHAR_W + 10,
              height: 30,
            }}
            initial={false}
            animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.15 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
        );
      })}

      {/* Шаг 1: код → контейнер «ищет по типу» (пунктир) */}
      {DEPS.map((d, i) => (
        <Arrow
          key={`find-${d.type}`}
          show={reading}
          from={[CODE_LEFT - 6, lineY(d.line)]}
          to={[BOX_LEFT + BOX_W + 6, d.top + BOX_CY]}
          tone={d.tone}
          dashed
          width={3}
          delay={i * 0.12}
          label={i === 0 ? 'ищет по типу' : undefined}
          labelOffset={[0, -46]}
        />
      ))}

      {/* Шаг 2–3: контейнер → параметры «подставляет» */}
      {DEPS.map((d, i) => (
        <Arrow
          key={`inject-${d.type}`}
          show={injected}
          from={[BOX_LEFT + BOX_W + 6, d.top + BOX_CY]}
          to={[CODE_LEFT - 6, lineY(d.line)]}
          tone={step === 3 && i > 0 ? 'muted' : d.tone}
          flow={step === 2}
          width={3}
          delay={i * 0.12}
          label={i === 0 ? 'подставляет' : undefined}
          labelOffset={[0, -46]}
        />
      ))}

      {/* ── Под кодом: кто делает new ────────────────────────────── */}
      <div className="absolute" style={{ left: CODE_LEFT, top: 452, width: CODE_W }}>
        <Swap k={step < 2 ? 'no-new' : step === 2 ? 'nest-new' : 'test'}>
          {step < 2 ? (
            <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-danger/40 bg-danger/5 px-6 py-5">
              <Ban size={30} className="shrink-0 text-danger" />
              <span className="text-[24px]">
                <M className="line-through decoration-danger decoration-2">new PrismaService()</M> — не пишем: объекты
                создаёт Nest
              </span>
            </div>
          ) : step === 2 ? (
            <Code
              code={`// при старте Nest делает это сам:\nnew CreateItemHandler(prisma, errors, notifications);`}
              lang="ts"
              size="sm"
            />
          ) : (
            <Code
              code={`// в тесте: фейк вместо базы — код хендлера тот же\n{ provide: PrismaService, useValue: fakePrisma }`}
              lang="ts"
              size="sm"
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 3 ? 'prisma' : 'logic'}
        captions={[
          <>
            Хендлер только перечисляет, что ему нужно. <M>new</M> нигде нет
          </>,
          'Nest читает типы параметров и ищет их в контейнере',
          '…и сам подставляет готовые объекты в конструктор',
          'Один PrismaService на всё приложение. В тесте — подменяем фейком',
        ]}
      />
    </SlideLayout>
  );
}
