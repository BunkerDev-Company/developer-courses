'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check, ChefHat, ConciergeBell, HandPlatter, ShieldCheck, X } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги:
 * 0 — один обработчик на Express делает всё: адрес, тело, токен, проверка, INSERT, ответ
 * 1 — эндпоинтов двадцать: проверка токена скопирована в каждый, в одном забыли → дыра
 * 2 — красим куски: каждый отвечает на свой вопрос
 * 3 — каждый кусок — в свой слой NestJS (= работник ресторана)
 */

// «Как не надо»: Express + jsonwebtoken + Prisma в одной функции. Не из etalon — для контраста.
const FAT_CODE = `app.post('/api/v1/items', async (req, res) => {
  const { title, price } = req.body;
  const token = req.headers.authorization?.slice(7);
  const user = jwt.verify(token, SECRET);
  if (user.role !== 'admin') return res.sendStatus(403);

  if (!title?.trim()) return res.sendStatus(400);
  const item = await prisma.item.create({
    data: { title, price, created_by: user.sub },
  });

  res.status(201).json({
    data: { id: item.id, price: Number(item.price), … },
  });
});`;

const CODE = { left: 0, top: 0, width: 700 };
const LH = 19 * 1.55;
const lineY = (n: number) => CODE.top + 45 + 16 + (n - 0.5) * LH;

interface Part {
  tone: Tone;
  icon: LucideIcon;
  lines: number[];
  /** Шаг 0: что делает «официант-универсал». */
  chore: string;
  /** Шаг 2: на какой вопрос отвечает кусок. */
  question: string;
  /** Шаг 3: кто это в ресторане и в NestJS. */
  role: string;
  tech: string;
}

const PARTS: Part[] = [
  {
    tone: 'ctrl',
    icon: ConciergeBell,
    lines: [1, 2],
    chore: 'принимает заказ',
    question: 'Куда и что прислали?',
    role: 'Официант',
    tech: 'ItemsController',
  },
  {
    tone: 'guard',
    icon: ShieldCheck,
    lines: [3, 4, 5],
    chore: 'проверяет пропуск',
    question: 'Кто ты и можно ли?',
    role: 'Охранник',
    tech: 'JwtAuthGuard · RolesGuard',
  },
  {
    tone: 'logic',
    icon: ChefHat,
    lines: [7, 8, 9, 10],
    chore: 'готовит',
    question: 'Что сделать?',
    role: 'Повар',
    tech: 'CreateItemHandler',
  },
  {
    tone: 'success',
    icon: HandPlatter,
    lines: [12, 13, 14],
    chore: 'выносит блюдо',
    question: 'Что отдать гостю?',
    role: 'Тарелка и поднос',
    tech: 'presentItem · Interceptor',
  },
];

const ROW = { left: 790, width: 650, height: 108, gap: 22 };
const rowTop = (i: number) => i * (ROW.height + ROW.gap);
const partY = (p: Part) => (lineY(p.lines[0]) + lineY(p.lines[p.lines.length - 1])) / 2;

const COPIES: { path: string; ok: boolean }[] = [
  { path: 'POST /items', ok: true },
  { path: 'PATCH /items/:id', ok: true },
  { path: 'DELETE /items/:id', ok: false },
  { path: 'POST /orders', ok: true },
];

const MARKS: Partial<Record<number, Tone>> = Object.fromEntries(
  PARTS.flatMap((p) => p.lines.map((n) => [n, p.tone] as const)),
);

export function MessSlide({ step }: SlideProps) {
  const split = step >= 2;

  return (
    <SlideLayout section="request" title="Как НЕ надо: один на всё">
      <Code
        code={FAT_CODE}
        lang="ts"
        size="sm"
        title="server.js — без NestJS"
        hl={step === 1 ? [3, 4, 5] : undefined}
        tone="danger"
        marks={split ? MARKS : undefined}
        className="absolute"
        style={CODE}
      />

      {/* Стрелки «кусок кода → его работа» */}
      {PARTS.map((p, i) => (
        <Arrow
          key={p.tone}
          show={split}
          from={[CODE.left + CODE.width + 8, partY(p)]}
          to={[ROW.left - 8, rowTop(i) + ROW.height / 2]}
          tone={p.tone}
          width={3}
          delay={i * 0.1}
        />
      ))}

      <div className="absolute" style={{ left: ROW.left, top: 0, width: ROW.width, height: 500 }}>
        <Swap k={step === 1 ? 'copies' : 'parts'}>
          {step === 1 ? <Copies /> : <Parts step={step} />}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 1 ? 'danger' : step >= 2 ? 'logic' : 'ctrl'}
        captions={[
          'Можно и так: одна функция делает всё — официант, который ещё и готовит',
          'Эндпоинтов 20 — проверку токена копируют в каждый. Забыли в одном — дыра',
          'Каждый кусок функции отвечает на свой вопрос',
          <>
            NestJS раскладывает куски по слоям — проверку пишут <b>один раз</b>
          </>,
        ]}
      />
    </SlideLayout>
  );
}

function Parts({ step }: { step: number }) {
  return (
    <>
      {PARTS.map((p, i) => {
        const t = TONE[p.tone];
        const on = step >= 2;
        return (
          <div
            key={p.tone}
            className={cn(
              'card absolute flex items-center gap-5 px-5 transition-[border-color] duration-300',
              on ? t.borderSoft : 'border-border',
            )}
            style={{ top: rowTop(i), left: 0, width: ROW.width, height: ROW.height }}
          >
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300',
                on ? cn(t.soft, t.text) : 'bg-surface-2 text-muted',
              )}
            >
              <p.icon size={30} />
            </div>
            <Swap k={step} className="min-w-0 flex-1">
              {step === 0 && (
                <div className="text-[26px] font-semibold">
                  <span className="text-muted">сам </span>
                  {p.chore}
                </div>
              )}
              {step === 2 && <div className="text-[28px] font-bold">{p.question}</div>}
              {step === 3 && (
                <div>
                  <div className="text-[26px] font-bold leading-tight">{p.role}</div>
                  <div className={cn('mt-1 truncate font-mono text-[19px] font-semibold', t.text)}>{p.tech}</div>
                </div>
              )}
            </Swap>
          </div>
        );
      })}
    </>
  );
}

function Copies() {
  return (
    <div className="flex flex-col gap-4">
      {COPIES.map((c, i) => (
        <motion.div
          key={c.path}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08, ease: EASE }}
          className={cn(
            'card flex items-center justify-between px-5',
            !c.ok && 'border-danger shadow-[0_0_0_6px_rgb(var(--c-danger)/0.15)]',
          )}
          style={{ height: 82 }}
        >
          <span className="font-mono text-[24px] font-semibold">{c.path}</span>
          {c.ok ? (
            <span className="flex items-center gap-2 text-[22px] font-semibold text-text-2">
              <Check size={24} className="text-success" /> копия проверки
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[22px] font-bold text-danger">
              <X size={24} strokeWidth={3} /> забыли — удалит любой
            </span>
          )}
        </motion.div>
      ))}
      <div className="pl-5 text-[24px] font-semibold text-muted">… и ещё 16 таких же функций</div>
    </div>
  );
}
