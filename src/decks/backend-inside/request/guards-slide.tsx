'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { CircleCheck, KeyRound, Route, ShieldCheck, X } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE, SPRING } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги:
 * 0 — запрос без токена: стоп на JwtAuthGuard → 401, code 1
 * 1 — токен роли user: JwtAuthGuard пропустил и записал userId/userRole → стоп на RolesGuard → 403, code 41
 * 2 — токен admin: проходит оба → контроллер
 * 3 — как это написано в контроллере + ловушка: @Roles() без @UseGuards
 */

type GateState = 'idle' | 'block' | 'open';

const ROAD = { top: 152, height: 96, width: 1160 };
const LANE_Y = ROAD.top + ROAD.height / 2;
const GATE_W = 350;

interface GateDef {
  x: number;
  icon: LucideIcon;
  name: string;
  question: string;
}

const GATES: GateDef[] = [
  { x: 470, icon: KeyRound, name: 'JwtAuthGuard', question: 'есть пропуск?' },
  { x: 860, icon: ShieldCheck, name: 'RolesGuard', question: 'пускают ли сюда с этим пропуском?' },
];

function gateStates(step: number): [GateState, GateState] {
  if (step === 0) return ['block', 'idle'];
  if (step === 1) return ['open', 'block'];
  return ['open', 'open'];
}

const PACKET_X = [300, 680, 1032, 1032];

const CODE_401 = `const token = this.extractToken(request);
if (!token) throw AppException.from('UNAUTHORIZED');`;

const CODE_403 = `// allowed = ['admin'] — из @Roles('admin')
const role = req['userRole'] as string | undefined;
if (!role || !allowed.includes(role)) {
  throw AppException.from('ROLE_FORBIDDEN');
}`;

const CODE_PASS = `const payload = this.jwtService.verify<JwtPayload>(token);
request['userId'] = payload.sub;
request['userRole'] = payload.role;
return true;`;

const CODE_OK = `@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
create(…) { … }`;

const CODE_BAD = `@Roles('admin')   // просто метка
@Post()
create(…) { … }   // зайдёт кто угодно`;

const RESP_401 = `{
  "error": { "code": 1, "message": "Unauthorized",
             "httpStatus": 401, "details": null },
  "responseTime": 1, …
}`;

const RESP_403 = `{
  "error": { "code": 41, "message": "Role Forbidden",
             "httpStatus": 403, "details": null },
  "responseTime": 2, …
}`;

function Gate({ gate, state }: { gate: GateDef; state: GateState }) {
  const Icon = gate.icon;
  return (
    <>
      {/* Карточка охранника */}
      <div
        className={cn(
          'card absolute flex items-center gap-4 px-5 transition-[border-color,box-shadow] duration-300',
          state === 'block' && 'border-danger shadow-[0_0_0_6px_rgb(var(--c-danger)/0.15)]',
          state === 'open' && 'border-success/60',
        )}
        style={{ left: gate.x - GATE_W / 2, top: 0, width: GATE_W, height: 116 }}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-guard/10 text-guard">
          <Icon size={30} />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[24px] font-semibold leading-tight">{gate.name}</div>
          <div className="mt-1 text-[21px] leading-tight text-text-2">{gate.question}</div>
        </div>
      </div>
      {/* Стойка */}
      <div className="absolute w-[3px] bg-guard/50" style={{ left: gate.x - 1, top: 116, height: ROAD.top - 116 }} />
      <div className="absolute z-10 h-4 w-4 rounded-full bg-guard" style={{ left: gate.x - 8, top: ROAD.top - 8 }} />
      {/* Шлагбаум: поперёк дороги — закрыт; повёрнут вдоль — открыт */}
      <motion.div
        className={cn(
          'absolute rounded-full transition-colors duration-300',
          state === 'block' ? 'bg-danger' : state === 'open' ? 'bg-success' : 'bg-border-2',
        )}
        style={{ left: gate.x - 6, top: ROAD.top - 4, width: 12, height: ROAD.height + 8, originX: 0.5, originY: 0 }}
        initial={false}
        animate={{ rotate: state === 'open' ? -90 : 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: state === 'open' ? 0.1 : 0 }}
      />
      {state === 'block' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute z-10 flex h-11 w-11 items-center justify-center rounded-full bg-danger text-white shadow-card"
          style={{ left: gate.x - 22, top: LANE_Y - 22 }}
        >
          <X size={26} strokeWidth={3} />
        </motion.div>
      )}
    </>
  );
}

function RequestPacket({ step }: { step: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-20"
      initial={false}
      animate={{ x: PACKET_X[step] ?? PACKET_X[0], y: LANE_Y }}
      transition={SPRING}
    >
      <div className="-translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border-2 border-client bg-surface px-4 py-2 shadow-lift">
        <div className="font-mono text-[19px] font-semibold">POST /api/v1/items</div>
        <Swap k={Math.min(step, 2)}>
          {step === 0 ? (
            <div className="text-[19px] font-semibold text-danger">без токена</div>
          ) : (
            <div className="flex items-center gap-2 font-mono text-[19px] font-semibold text-guard">
              <KeyRound size={18} /> role: &apos;{step === 1 ? 'user' : 'admin'}&apos;
            </div>
          )}
        </Swap>
      </div>
    </motion.div>
  );
}

/** Плашка под шлагбаумом: что guard сделал. */
function GateBadge({ x, k, children }: { x: number; k: string; children: React.ReactNode }) {
  return (
    <div className="absolute flex -translate-x-1/2 justify-center" style={{ left: x, top: ROAD.top + ROAD.height + 16 }}>
      <Swap k={k}>{children}</Swap>
    </div>
  );
}

export function GuardsSlide({ step }: SlideProps) {
  const [g1, g2] = gateStates(step);
  const role = step === 1 ? 'user' : 'admin';
  const lower = 332;

  return (
    <SlideLayout section="request" title="Guards: охрана на входе">
      {/* Дорога запроса с двумя шлагбаумами; на шаге 3 уходит на второй план */}
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: step === 3 ? 0.3 : 1 }} transition={{ duration: 0.4 }}>
        <div
          className="absolute rounded-3xl border-2 border-dashed border-border-2 bg-surface-2"
          style={{ left: 0, top: ROAD.top, width: ROAD.width, height: ROAD.height }}
        />
        <Gate gate={GATES[0]} state={g1} />
        <Gate gate={GATES[1]} state={g2} />

        <NodeBox
          tone="ctrl"
          icon={Route}
          title="Controller"
          sub="create()"
          state={step === 2 ? 'active' : step < 2 ? 'dim' : 'idle'}
          className="absolute"
          style={{ left: 1186, top: LANE_Y - 46, width: 254 }}
        />

        <RequestPacket step={step} />

        <GateBadge x={GATES[0].x} k={step === 0 ? 'err' : role}>
          {step === 0 ? (
            <Chip tone="danger" solid>
              401 · code 1
            </Chip>
          ) : (
            <Chip tone="guard">request.userRole = &apos;{role}&apos;</Chip>
          )}
        </GateBadge>
        <GateBadge x={GATES[1].x} k={step === 0 ? 'none' : step === 1 ? 'err' : 'ok'}>
          {step === 0 ? null : step === 1 ? (
            <Chip tone="danger" solid>
              403 · code 41
            </Chip>
          ) : (
            <Chip tone="success">admin ✓</Chip>
          )}
        </GateBadge>
      </motion.div>

      {/* Снизу слева: строка guard'а, которая сработала */}
      <div className="absolute" style={{ left: 0, top: lower, width: 740 }}>
        <Swap k={step}>
          {step === 0 && <Code code={CODE_401} lang="ts" size="sm" title="common/guards/jwt-auth.guard.ts" hl={[2]} tone="danger" />}
          {step === 1 && <Code code={CODE_403} lang="ts" size="sm" title="common/guards/roles.guard.ts" hl={[3, 4]} tone="danger" />}
          {step === 2 && <Code code={CODE_PASS} lang="ts" size="sm" title="common/guards/jwt-auth.guard.ts" hl={[2, 3]} tone="guard" />}
          {step === 3 && (
            <Code
              code={CODE_OK}
              lang="ts"
              size="sm"
              title={<span className="text-code-string">items.controller.ts — так ✓</span>}
              hl={[1, 2]}
              tone="success"
            />
          )}
        </Swap>
      </div>

      {/* Снизу справа: что получил клиент / ловушка */}
      <div className="absolute" style={{ left: 780, top: lower, width: 660 }}>
        <Swap k={step}>
          {step === 0 && <Code code={RESP_401} lang="json" size="sm" title={<span className="text-code-prop">ответ: HTTP 401</span>} />}
          {step === 1 && <Code code={RESP_403} lang="json" size="sm" title={<span className="text-code-prop">ответ: HTTP 403</span>} />}
          {step === 2 && (
            <div className="card flex items-center gap-5 border-success/60 px-6 py-6">
              <CircleCheck size={44} className="shrink-0 text-success" />
              <div>
                <div className="text-[26px] font-semibold">Оба guard&apos;а пропустили</div>
                <div className="mt-1 text-[22px] text-text-2">
                  дальше — <M>ItemsController.create()</M>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <Code
              code={CODE_BAD}
              lang="ts"
              size="sm"
              title={<span className="text-code-prop">без @UseGuards — дыра ✗</span>}
              hl={[1, 3]}
              tone="danger"
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 3 ? 'danger' : 'guard'}
        captions={[
          <>Нет токена — JwtAuthGuard сразу отвечает 401, дальше запрос не идёт</>,
          <>Пропуск есть, но роль user — RolesGuard отвечает 403</>,
          <>admin проходит оба — запрос попадает в контроллер</>,
          <>
            <M>@Roles()</M> без <M>@UseGuards</M> — просто метка, её никто не проверяет
          </>,
        ]}
      />
    </SlideLayout>
  );
}
