'use client';

import type { LucideIcon } from 'lucide-react';
import { Braces, Bus, Cog, Database, Globe, Mail, Route, ShieldCheck, Triangle } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import type { NodeState } from '@/components/ui/node-box';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { Tone } from '@/lib/tones';
import type { SlideProps } from '@/types';
import { FlowNode } from './a-flow-node';
import { InfoPacket } from './a-packet';
import { REQ } from './data';

/**
 * Главная карта раздела. U-образная схема:
 *   верх  →  Клиент → Guards → Controller → CommandBus → Handler → Prisma → PostgreSQL
 *   низ   ←  Клиент ← Interceptor ← Presenter ←────────────────────────────┘
 * Шаг = номер активного блока (0…9). Пакет летит по блокам и меняет содержимое.
 */

const W = 176; // ширина блока верхнего ряда
const H = 128; // высота любого блока
const STEP_X = (1440 - W) / 6; // шаг колонки ≈ 210.7
const colX = (i: number) => i * STEP_X;
const colC = (i: number) => colX(i) + W / 2;
const TOP_Y = 0;
const BOT_Y = 416;
const BOT_W = 224; // нижние блоки шире: длинные имена

interface NodeDef {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  sub: string;
  x: number;
  y: number;
  w: number;
}

const NODES: NodeDef[] = [
  { tone: 'client', icon: Globe, title: 'Клиент', sub: 'браузер', x: colX(0), y: TOP_Y, w: W },
  { tone: 'guard', icon: ShieldCheck, title: 'Guards', sub: 'JWT + роль', x: colX(1), y: TOP_Y, w: W },
  { tone: 'ctrl', icon: Route, title: 'Controller', sub: 'ItemsController', x: colX(2), y: TOP_Y, w: W },
  { tone: 'logic', icon: Bus, title: 'CommandBus', sub: '@nestjs/cqrs', x: colX(3), y: TOP_Y, w: W },
  { tone: 'logic', icon: Cog, title: 'Handler', sub: 'CreateItemHandler', x: colX(4), y: TOP_Y, w: W },
  { tone: 'prisma', icon: Triangle, title: 'Prisma', sub: 'prisma.item', x: colX(5), y: TOP_Y, w: W },
  { tone: 'db', icon: Database, title: 'PostgreSQL', sub: 'таблица "Item"', x: colX(6), y: TOP_Y, w: W },
  // Нижний ряд — ответ, справа налево. Presenter — под Handler: его вызывает хендлер.
  { tone: 'success', icon: Braces, title: 'Presenter', sub: 'presentItem()', x: colC(4) - BOT_W / 2, y: BOT_Y, w: BOT_W },
  { tone: 'success', icon: Mail, title: 'Interceptor', sub: 'ResponseInterceptor', x: colC(2) - BOT_W / 2, y: BOT_Y, w: BOT_W },
  { tone: 'client', icon: Globe, title: 'Клиент', sub: '201 Created', x: colX(0), y: BOT_Y, w: W },
];

interface PacketDef {
  at: [number, number];
  label: string;
  lines: string[];
}

const UP_Y = 224; // пакет под верхним рядом
const DOWN_Y = 300; // пакет над нижним рядом

const PACKETS: PacketDef[] = [
  { at: [162, UP_Y], label: 'POST /api/v1/items', lines: [`{ "title": "${REQ.body.title}",`, `  "price": ${REQ.body.price} }`] },
  { at: [colC(1), UP_Y], label: 'пропуск проверен', lines: ['JWT ✓  admin ✓'] },
  { at: [colC(2), UP_Y], label: '@Body() → DTO', lines: ['dto: CreateItemDto'] },
  { at: [colC(3), UP_Y], label: 'команда → в шину', lines: ['new CreateItemCommand(userId, dto)'] },
  { at: [colC(4), UP_Y], label: 'execute(command)', lines: ['prisma.item.create({ data })'] },
  { at: [colC(5) - 22, UP_Y], label: 'Prisma → SQL', lines: ['INSERT INTO "Item" (…)', 'VALUES (…) RETURNING …'] },
  {
    at: [1196, 290],
    label: 'строка БД: snake_case, Decimal',
    lines: [`{ id: "${REQ.itemId}",`, '  price: Decimal("1990.00"),', '  is_active: true, created_by, … }'],
  },
  {
    at: [colC(4), DOWN_Y],
    label: 'presentItem(item)',
    lines: [`{ id, title: "${REQ.body.title}",`, '  price: 1990, isActive: true, … }'],
  },
  {
    at: [colC(2), DOWN_Y],
    label: 'конверт ответа',
    lines: ['{ data: { id, title, price, … },', `  responseTime: ${REQ.responseTime}, … }`],
  },
  { at: [214, DOWN_Y], label: 'HTTP 201 Created', lines: [`{ "data": { "id": "${REQ.itemId}",`, `  "price": ${REQ.body.price}, … }, … }`] },
];

function nodeState(i: number, step: number): NodeState {
  if (i === step) return 'active';
  return i < step ? 'done' : 'idle';
}

export function OverviewSlide({ step }: SlideProps) {
  const p = PACKETS[step] ?? PACKETS[0];
  const midY = TOP_Y + H / 2;
  const botMidY = BOT_Y + H / 2;
  const [presenter, interceptor, clientBack] = [NODES[7], NODES[8], NODES[9]];

  return (
    <SlideLayout section="request" title="Путь запроса целиком">
      {/* Стрелки верхнего ряда: запрос идёт слева направо */}
      {NODES.slice(0, 6).map((n, i) => {
        const next = NODES[i + 1];
        const passed = i + 1 <= step;
        return (
          <Arrow
            key={n.title + i}
            from={[n.x + n.w + 4, midY]}
            to={[next.x - 5, midY]}
            tone={passed ? next.tone : 'muted'}
            flow={i + 1 === step}
            width={3}
          />
        );
      })}

      {/* Поворот: строка из базы возвращается к хендлеру → presenter */}
      <Arrow
        from={[colC(6), TOP_Y + H + 6]}
        to={[presenter.x + presenter.w + 8, botMidY]}
        curve={-90}
        tone={step >= 6 ? 'db' : 'muted'}
        flow={step === 6 || step === 7}
        width={3}
      />

      {/* Нижний ряд: ответ идёт справа налево */}
      <Arrow
        from={[presenter.x - 6, botMidY]}
        to={[interceptor.x + interceptor.w + 8, botMidY]}
        tone={step >= 8 ? 'success' : 'muted'}
        flow={step === 8}
        width={3}
      />
      <Arrow
        from={[interceptor.x - 6, botMidY]}
        to={[clientBack.x + clientBack.w + 8, botMidY]}
        tone={step >= 9 ? 'client' : 'muted'}
        flow={step === 9}
        width={3}
      />

      {NODES.map((n, i) => (
        <FlowNode
          key={n.title + i}
          tone={n.tone}
          icon={n.icon}
          title={n.title}
          sub={n.sub}
          state={nodeState(i, step)}
          style={{ left: n.x, top: n.y, width: n.w, height: H }}
        />
      ))}

      <InfoPacket at={p.at} tone={NODES[step]?.tone ?? 'client'} k={step} label={p.label} lines={p.lines} />

      <StepCaption
        step={step}
        tone={NODES[step]?.tone ?? 'ctrl'}
        captions={[
          <>Админ жмёт «Создать»: браузер шлёт POST с JSON и токеном</>,
          <>Guards: токен настоящий? роль admin? — пропускают дальше</>,
          <>
            Controller: тело запроса → <M>CreateItemDto</M>
          </>,
          <>Controller упаковал userId и dto в команду и отдал в шину</>,
          <>
            CommandBus нашёл <M>CreateItemHandler</M> — тут вся логика
          </>,
          <>Prisma превращает вызов в SQL-запрос INSERT</>,
          <>PostgreSQL сохранил строку и вернул её: snake_case, Decimal</>,
          <>
            <M>presentItem</M>: camelCase, Decimal → number
          </>,
          <>
            ResponseInterceptor заворачивает ответ в конверт <M>{'{ data, … }'}</M>
          </>,
          <>Клиент получил 201 Created — товар создан</>,
        ]}
      />
    </SlideLayout>
  );
}
