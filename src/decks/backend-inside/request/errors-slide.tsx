'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check, CircleX, Cog, Globe, Mail, Route, Send, ShieldAlert, ShieldCheck, Triangle, Zap } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { DataTable } from '@/components/ui/data-table';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { REQ } from './data';

/**
 * Шаги:
 * 0 — в хендлере title пустой → errors.throw('VALIDATION', …)
 * 1 — Prisma / Interceptor / 201 пропущены, исключение летит в GlobalExceptionFilter
 * 2 — фильтр отвечает конвертом ошибки (400, code 5, details)
 * 3 — фронт показывает details в тосте
 * 4 — непредвиденная ошибка (Prisma упала) → 500, code 99, details: null + ErrorLog
 */

type PillState = 'idle' | 'done' | 'error' | 'dim';

const PILLS: { label: string; tone: Tone; icon: LucideIcon }[] = [
  { label: 'Guards', tone: 'guard', icon: ShieldCheck },
  { label: 'Controller', tone: 'ctrl', icon: Route },
  { label: 'Handler', tone: 'logic', icon: Cog },
  { label: 'Prisma', tone: 'prisma', icon: Triangle },
  { label: 'Interceptor', tone: 'success', icon: Mail },
  { label: '201 Created', tone: 'success', icon: Send },
];
const PILL_W = 196;
const PILL_H = 60;
const PILL_STEP = 248;
const pillX = (i: number) => i * PILL_STEP;
const pillCX = (i: number) => pillX(i) + PILL_W / 2;

const SNIPPET_LEFT = 520;
const SNIPPET_TOP = 92;

const VALIDATE = `if (typeof data.title !== 'string' || !data.title.trim())
  errors.throw('VALIDATION', 'Название обязательно');`;

const PRISMA_FAIL = `PrismaClientKnownRequestError  code: 'P2022'
The column \`image_url\` does not exist …`;

const JSON_400 = `{
  "error": {
    "code": 5,
    "message": "Validation Error",
    "httpStatus": 400,
    "details": "Название обязательно"
  },
  "responseTime": 3, …
}`;

const JSON_500 = `{
  "error": {
    "code": 99,
    "message": "Internal Server Error",
    "httpStatus": 500,
    "details": null
  },
  "responseTime": 8, …
}`;

function pillState(i: number, step: number): PillState {
  const failAt = step === 4 ? 3 : 2; // Handler или Prisma
  if (i < failAt) return 'done';
  if (i === failAt) return 'error';
  return step === 0 ? 'idle' : 'dim';
}

export function ErrorsSlide({ step }: SlideProps) {
  const crash = step === 4;
  const failAt = crash ? 3 : 2;
  const thrown = step >= 1;

  return (
    <SlideLayout section="request" title="Ошибка на любом шаге">
      {/* ── Мини-схема пути ──────────────────────────────────────── */}
      {PILLS.map((p, i) => (
        <Pill key={p.label} {...p} x={pillX(i)} state={pillState(i, step)} />
      ))}
      {PILLS.slice(0, -1).map((p, i) => (
        <Arrow
          key={p.label}
          from={[pillX(i) + PILL_W + 4, PILL_H / 2]}
          to={[pillX(i + 1) - 6, PILL_H / 2]}
          tone={i < failAt ? 'muted' : 'muted'}
          width={3}
          show={i < failAt || step === 0}
        />
      ))}
      <motion.div
        className="absolute text-center text-[18px] font-semibold text-danger"
        style={{ left: pillX(failAt + 1), width: (PILLS.length - failAt - 1) * PILL_STEP - 52, top: PILL_H + 4 }}
        initial={false}
        animate={{ opacity: thrown ? 1 : 0 }}
        transition={{ duration: 0.35, delay: thrown ? 0.3 : 0 }}
      >
        ↷ пропущены
      </motion.div>

      {/* Тело запроса */}
      <Reveal show={!crash} from="left" className="absolute" style={{ left: 0, top: 112 }}>
        <div className="mb-1.5 text-[17px] font-semibold text-text-2">тело запроса</div>
        <Chip tone="danger">{`{ "title": "", "price": ${REQ.body.price} }`}</Chip>
      </Reveal>

      {/* Где упало: код validate / ошибка Prisma */}
      <Arrow
        from={[pillCX(failAt), PILL_H + 4]}
        to={[pillCX(failAt), SNIPPET_TOP - 4]}
        tone="danger"
        width={3}
      />
      <div className="absolute" style={{ left: SNIPPET_LEFT, top: SNIPPET_TOP, width: 720 }}>
        <Swap k={crash ? 'prisma' : 'validate'}>
          {crash ? (
            <Code code={PRISMA_FAIL} lang="text" size="sm" title="prisma.item.create() — в базе нет колонки (забыли migrate:up)" />
          ) : (
            <Code code={VALIDATE} lang="ts" size="sm" title="item-commands.handler.ts · validate()" hl={[2]} tone="danger" />
          )}
        </Swap>
      </div>

      {/* ── GlobalExceptionFilter ────────────────────────────────── */}
      <Arrow
        show={thrown}
        from={[SNIPPET_LEFT + 30, SNIPPET_TOP + 140]}
        to={[340, 284]}
        curve={-30}
        tone="danger"
        flow={step === 1 || crash}
        label={crash ? 'Error' : 'AppException'}
      />
      <NodeBox
        tone="danger"
        icon={ShieldAlert}
        title="GlobalExceptionFilter"
        sub="ловит исключение с любого слоя"
        state={thrown ? 'active' : 'dim'}
        className="absolute"
        style={{ left: 0, top: 290, width: 560 }}
      />

      {/* Ответ с ошибкой */}
      <Arrow show={step >= 2} from={[566, 335]} to={[594, 335]} tone="danger" width={3} />
      <Reveal show={step >= 2} from="left" className="absolute" style={{ left: 600, top: 250, width: 560 }}>
        <Swap k={crash ? 500 : 400}>
          <Code
            code={crash ? JSON_500 : JSON_400}
            lang="json"
            size="sm"
            hl={crash ? [3, 6] : step === 3 ? [6] : [3, 4, 5, 6]}
            tone="danger"
          />
        </Swap>
      </Reveal>
      <Reveal show={step >= 2} delay={0.15} className="absolute" style={{ left: 1190, top: 250, width: 250 }}>
        <div className={cn('card border-danger/50 px-5 py-4')}>
          <div className="text-[17px] font-semibold uppercase tracking-wider text-muted">HTTP</div>
          <Swap k={crash ? 500 : 400}>
            <div className="text-[64px] font-extrabold leading-none text-danger">{crash ? 500 : 400}</div>
            <div className="mt-2 text-[20px] font-semibold leading-snug">
              {crash ? 'Internal Server Error' : 'Bad Request'}
            </div>
            <div className="mt-3">
              <Chip tone="danger" size="sm">
                {crash ? 'INTERNAL · code 99' : 'VALIDATION · code 5'}
              </Chip>
            </div>
          </Swap>
        </div>
      </Reveal>

      {/* Низ слева: тост на фронте / запись в ErrorLog */}
      <Arrow show={step === 3} from={[598, 470]} to={[566, 470]} tone="client" width={3} />
      <Arrow show={crash} from={[280, 384]} to={[280, 408]} tone="danger" width={3} />
      <div className="absolute" style={{ left: 0, top: 412, width: 560 }}>
        <Swap k={crash ? 'log' : step === 3 ? 'toast' : 'none'}>
          {step === 3 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-[17px] font-semibold text-client">
                <Globe size={20} /> браузер
              </div>
              <div className="card flex items-center gap-4 px-5 py-3.5 shadow-lift">
                <CircleX size={30} className="shrink-0 text-danger" />
                <span className="text-[24px] font-semibold">Название обязательно</span>
              </div>
              <div className="mt-2 font-mono text-[17px] text-text-2">onError: (e) =&gt; toast.error(apiError(e))</div>
            </div>
          )}
          {crash && (
            <DataTable
              title="ErrorLog ← errorService.log()"
              tone="db"
              columns={['func_name', 'error_message']}
              grid="210px 1fr"
              size="sm"
              rows={[
                {
                  key: 'e1',
                  cells: ['POST /api/v1/items', 'The column `image_url` does not exist…'],
                  state: 'new',
                },
              ]}
            />
          )}
          {!crash && step !== 3 && <div />}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 3 ? 'client' : 'danger'}
        captions={[
          <>
            В хендлере title пустой → <M>errors.throw(&apos;VALIDATION&apos;, …)</M>
          </>,
          'Остальные слои пропущены — исключение летит в фильтр',
          'Фильтр отвечает конвертом ошибки: 400, code 5, details',
          'Фронт показывает details в тосте — как есть',
          'Непредвиденная ошибка → 500, code 99, details: null + ErrorLog',
        ]}
      />
    </SlideLayout>
  );
}

function Pill({ label, tone, icon: Icon, x, state }: { label: string; tone: Tone; icon: LucideIcon; x: number; state: PillState }) {
  const t = TONE[tone];
  return (
    <motion.div
      className={cn(
        'absolute flex items-center justify-center gap-2.5 rounded-2xl border-2 bg-surface text-[22px] font-semibold shadow-card transition-colors duration-300',
        state === 'error' ? 'border-danger bg-danger/5 text-danger shadow-[0_0_0_6px_rgb(var(--c-danger)/0.15)]' : cn(t.borderSoft, t.text),
      )}
      style={{ left: x, top: 0, width: PILL_W, height: PILL_H }}
      initial={false}
      animate={{ opacity: state === 'dim' ? 0.3 : 1, scale: state === 'error' ? 1.05 : 1 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <Icon size={24} />
      <span className={cn(state === 'dim' && 'line-through decoration-2')}>{label}</span>
      {(state === 'done' || state === 'error') && (
        <span
          className={cn(
            'absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-card',
            state === 'done' ? 'bg-success' : 'bg-danger',
          )}
        >
          {state === 'done' ? <Check size={20} strokeWidth={3} /> : <Zap size={20} strokeWidth={2.5} fill="currentColor" />}
        </span>
      )}
    </motion.div>
  );
}
