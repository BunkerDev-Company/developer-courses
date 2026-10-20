'use client';

import type { LucideIcon } from 'lucide-react';
import { BellRing, Bus, Cog, Database, Gamepad2, Mail, MonitorSmartphone, Route, ShieldCheck, Wallet } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import type { NodeState } from '@/components/ui/node-box';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { Tone } from '@/lib/tones';
import type { SlideProps } from '@/types';
import { FlowNode } from '../../backend-inside/request/a-flow-node';
import { InfoPacket } from '../../backend-inside/request/a-packet';
import { EX } from '../data';

/**
 * Покупка «Силы» 3-го уровня: POST /api/v1/shop/might/buy.
 * Верх: игра → guard → контроллер → шина → хендлер → кошелёк → база.
 * Низ: ответ через ResponseInterceptor и пуш wallet:update во все вкладки.
 * Шаг = активный блок (0…8).
 */

const W = 176;
const H = 128;
const STEP_X = (1440 - W) / 6;
const colX = (i: number) => i * STEP_X;
const colC = (i: number) => colX(i) + W / 2;
const TOP = 0;
const BOT = 330;

interface NodeDef {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  sub: string;
  x: number;
  y: number;
}

const NODES: NodeDef[] = [
  { tone: 'client', icon: Gamepad2, title: 'Игра', sub: 'лавка', x: colX(0), y: TOP },
  { tone: 'guard', icon: ShieldCheck, title: 'Guard', sub: 'JwtAuthGuard', x: colX(1), y: TOP },
  { tone: 'ctrl', icon: Route, title: 'Controller', sub: 'ShopController', x: colX(2), y: TOP },
  { tone: 'logic', icon: Bus, title: 'CommandBus', sub: '@nestjs/cqrs', x: colX(3), y: TOP },
  { tone: 'logic', icon: Cog, title: 'Handler', sub: 'BuyUpgradeHandler', x: colX(4), y: TOP },
  { tone: 'prisma', icon: Wallet, title: 'Кошелёк', sub: 'WalletService', x: colX(5), y: TOP },
  { tone: 'db', icon: Database, title: 'PostgreSQL', sub: '"Wallet"', x: colX(6), y: TOP },
  { tone: 'success', icon: Mail, title: 'Interceptor', sub: 'ResponseInterceptor', x: colX(2), y: BOT },
  { tone: 'logic', icon: BellRing, title: 'Событие', sub: 'WalletPushHandler', x: colX(4), y: BOT },
  { tone: 'client', icon: MonitorSmartphone, title: 'Все вкладки', sub: 'wallet:update', x: colX(0), y: BOT },
];

const PY = 214; // пакеты верхнего ряда — под блоками
const PACKETS: { at: [number, number]; label: string; lines: string[] }[] = [
  { at: [190, PY], label: `POST /api/v1/shop/${EX.upgrade}/buy`, lines: ['Authorization: Bearer …', 'тела нет'] },
  { at: [colC(1), PY], label: 'токен проверен', lines: [`userId = ${EX.userId}`] },
  { at: [colC(2), PY], label: 'команда', lines: [`new BuyUpgradeCommand(userId, '${EX.upgrade}')`] },
  { at: [colC(3), PY], label: 'шина нашла хендлер', lines: ['→ BuyUpgradeHandler'] },
  { at: [colC(4), PY], label: 'хендлер считает', lines: [`уровень 2 → ${EX.level}`, `upgradePrice → ${EX.price}`] },
  { at: [colC(5) - 30, PY], label: '$transaction', lines: [`debit ${EX.price}, ref upgrade:${EX.upgrade}:${EX.level}`, 'upsert уровня'] },
  { at: [1230, PY], label: 'COMMIT', lines: [`balance ${EX.balanceBefore} → ${EX.balanceAfter}`] },
  { at: [1236, 394], label: 'HTTP 201 — в конверте', lines: ['{ "data": {', `    "level": ${EX.level}, "balance": ${EX.balanceAfter},`, `    "nextPrice": ${EX.nextPrice} }, … }`] },
  { at: [1236, 394], label: 'wallet:update — по сокету', lines: [`{ balance: ${EX.balanceAfter}, delta: -${EX.price},`, "  reason: 'upgrade' }"] },
];

function stateOf(i: number, step: number): NodeState {
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  if (step === 7) return i === 7 || i === 0 ? 'active' : i <= 6 ? 'done' : 'idle';
  if (step === 8) return i === 8 || i === 9 ? 'active' : i <= 7 ? 'done' : 'idle';
  if (i > 6) return 'idle';
  return order[i] === step ? 'active' : i < step ? 'done' : 'idle';
}

export function OverviewSlide({ step }: SlideProps) {
  const p = PACKETS[step] ?? PACKETS[0];
  const mid = TOP + H / 2;
  const tone: Tone = step === 7 ? 'success' : step === 8 ? 'logic' : NODES[step].tone;

  return (
    <SlideLayout section="request" title="Путь запроса: покупка в лавке">
      {NODES.slice(0, 6).map((n, i) => (
        <Arrow key={n.title} from={[n.x + W + 4, mid]} to={[NODES[i + 1].x - 5, mid]} tone={i + 1 <= step && step < 7 ? NODES[i + 1].tone : 'muted'} flow={i + 1 === step} width={3} />
      ))}

      {/* Ответ: хендлер → конверт → игра */}
      <Arrow from={[colC(4) - 20, TOP + H + 6]} to={[colX(2) + W + 8, BOT + 30]} tone={step === 7 ? 'success' : 'muted'} flow={step === 7} width={3} />
      <Arrow from={[colX(2) - 6, BOT + 30]} to={[colC(0), TOP + H + 8]} tone={step === 7 ? 'success' : 'muted'} flow={step === 7} width={3} />

      {/* Событие: хендлер → пуш → все вкладки */}
      <Arrow from={[colC(4) + 20, TOP + H + 6]} to={[colC(4) + 20, BOT - 8]} tone={step === 8 ? 'logic' : 'muted'} flow={step === 8} width={3} />
      <Arrow from={[colC(4), BOT + H + 6]} to={[colC(0), BOT + H + 8]} curve={-60} tone={step === 8 ? 'client' : 'muted'} flow={step === 8} width={3} />

      {NODES.map((n, i) => (
        <FlowNode key={n.title} tone={n.tone} icon={n.icon} title={n.title} sub={n.sub} state={stateOf(i, step)} style={{ left: n.x, top: n.y, width: W, height: H }} />
      ))}

      <InfoPacket at={p.at} tone={tone} k={step} label={p.label} lines={p.lines} />

      <StepCaption
        step={step}
        tone={tone}
        captions={[
          'Игрок жмёт «Купить»: POST с токеном — и без тела',
          'JwtAuthGuard: токен настоящий — userId кладёт в request',
          'Контроллер: userId из токена, код улучшения из пути → команда',
          'Шина находит хендлер — как в магазине',
          'Хендлер: какой уровень следующий и сколько он стоит — решает сервер',
          'Кошелёк: списание и новый уровень — в одной транзакции',
          'База закоммитила: баланс 175',
          'Ответ уходит в конверте ResponseInterceptor',
          'А событие WalletChangedEvent обновит баланс во всех вкладках игрока',
        ]}
      />
    </SlideLayout>
  );
}
