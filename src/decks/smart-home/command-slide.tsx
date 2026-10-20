'use client';

import type { LucideIcon } from 'lucide-react';
import { Cable, Cog, Database, Radio, Route, ShieldCheck, Smartphone } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import type { NodeState } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { Tone } from '@/lib/tones';
import type { SlideProps } from '@/types';
import { FlowNode } from '../backend-inside/request/a-flow-node';
import { InfoPacket } from '../backend-inside/request/a-packet';
import { KETTLE_ID, T, TOPIC } from './data';
import { KettleIcon } from './parts';

/**
 * U-образная схема, как «Путь запроса целиком», только конец пути — чайник:
 *   верх  →  Приложение → Guard → Controller → Handler → MqttService → Брокер → Чайник
 *   низ   ←  Приложение ← WebSocket ← Handler состояния → БД      (↑ состояние от чайника через брокер)
 * Шаг = где сейчас «пакет» (0…8).
 */

const W = 176;
const H = 128;
const STEP_X = (1440 - W) / 6;
const colX = (i: number) => i * STEP_X;
const colC = (i: number) => colX(i) + W / 2;
const TOP_Y = 0;
const BOT_Y = 416;
const MID = TOP_Y + H / 2;
const BOT_MID = BOT_Y + H / 2;

interface NodeDef {
  key: string;
  tone: Tone;
  icon: LucideIcon;
  title: string;
  sub: string;
  col: number;
  y: number;
  /** На каких шагах блок «работает». */
  on: number[];
}

const NODES: NodeDef[] = [
  { key: 'app', tone: T.app, icon: Smartphone, title: 'Приложение', sub: 'кнопка «90°»', col: 0, y: TOP_Y, on: [0] },
  { key: 'guard', tone: 'guard', icon: ShieldCheck, title: 'Guard', sub: 'JWT', col: 1, y: TOP_Y, on: [1] },
  { key: 'ctrl', tone: 'ctrl', icon: Route, title: 'Controller', sub: 'DevicesController', col: 2, y: TOP_Y, on: [2] },
  { key: 'handler', tone: T.backend, icon: Cog, title: 'Handler', sub: 'SendDeviceCommand', col: 3, y: TOP_Y, on: [3] },
  { key: 'mqtt', tone: T.backend, icon: Cable, title: 'MqttService', sub: 'publish', col: 4, y: TOP_Y, on: [4] },
  { key: 'broker', tone: T.broker, icon: Radio, title: 'Брокер', sub: 'Mosquitto', col: 5, y: TOP_Y, on: [5, 6] },
  { key: 'kettle', tone: T.device, icon: KettleIcon, title: 'Чайник', sub: KETTLE_ID, col: 6, y: TOP_Y, on: [5, 6] },
  { key: 'appBack', tone: T.app, icon: Smartphone, title: 'Приложение', sub: '63° на экране', col: 0, y: BOT_Y, on: [8] },
  { key: 'ws', tone: 'ctrl', icon: Cable, title: 'WebSocket', sub: 'device:state', col: 2, y: BOT_Y, on: [8] },
  { key: 'reported', tone: T.backend, icon: Cog, title: 'Handler', sub: 'DeviceReported', col: 4, y: BOT_Y, on: [7] },
  { key: 'db', tone: T.db, icon: Database, title: 'PostgreSQL', sub: 'Device, Reading', col: 6, y: BOT_Y, on: [7] },
];

const UP_Y = 224;
const DOWN_Y = 316;

const PACKETS: { at: [number, number]; label: string; lines: string[] }[] = [
  { at: [190, UP_Y], label: `POST …/devices/${KETTLE_ID}/commands`, lines: ['{ "target": 90 }'] },
  { at: [colC(1), UP_Y], label: 'токен проверен', lines: ['userId ✓'] },
  { at: [colC(2), UP_Y], label: '→ команда в шину', lines: ['SendDeviceCommand(', '  userId, kettle-1, 90)'] },
  { at: [colC(3), UP_Y], label: 'проверки → desired в БД', lines: ['чайник в моём доме? ✓', '40 ≤ 90 ≤ 100 ✓'] },
  { at: [colC(4), UP_Y], label: 'publish, QoS 1', lines: [TOPIC.set, '{ power: on, target: 90 }'] },
  { at: [colC(5) + 40, UP_Y], label: 'брокер → чайнику', lines: ['доставлено ✓', 'реле: вкл'] },
  { at: [1200, DOWN_Y - 30], label: `${TOPIC.state}`, lines: ['{ power: on,', '  temperature: 63 }'] },
  { at: [colC(4), DOWN_Y], label: 'reported + Reading', lines: ['UPDATE "Device"', 'INSERT "Reading"'] },
  { at: [colC(1), DOWN_Y], label: 'socket.io → комнате дома', lines: ["emit('device:state')"] },
];

function stateOf(n: NodeDef, step: number): NodeState {
  return n.on.includes(step) ? 'active' : 'idle';
}

export function CommandSlide({ step }: SlideProps) {
  const p = PACKETS[step] ?? PACKETS[0];
  const packetTone = NODES.find((n) => n.on.includes(step))?.tone ?? T.backend;
  const top = NODES.filter((n) => n.y === TOP_Y);

  return (
    <SlideLayout section="backend" title="Путь команды «вскипяти до 90°»">
      {/* Верх: команда слева направо */}
      {top.slice(0, -1).map((n, i) => (
        <Arrow
          key={n.key}
          from={[colX(n.col) + W + 4, MID - 10]}
          to={[colX(top[i + 1].col) - 5, MID - 10]}
          tone={step > i ? top[i + 1].tone : 'muted'}
          flow={step === i + 1}
          width={3}
        />
      ))}

      {/* Обратно: чайник → брокер (состояние) */}
      <Arrow show={step >= 6} from={[colX(6) - 5, MID + 18]} to={[colX(5) + W + 6, MID + 18]} tone={T.device} flow={step === 6} width={3} />
      {/* Брокер → обработчик состояния (через ту же подписку MqttService) */}
      <Arrow
        show={step >= 6}
        from={[colC(5), TOP_Y + H + 6]}
        to={[colX(4) + W + 6, BOT_MID - 20]}
        curve={-40}
        tone={T.broker}
        flow={step === 6 || step === 7}
        width={3}
        label="подписка dev/+/state"
        labelOffset={[70, -10]}
      />
      {/* Низ: сохранить и разослать */}
      <Arrow show={step >= 7} from={[colX(4) + W + 4, BOT_MID]} to={[colX(6) - 6, BOT_MID]} tone={T.db} flow={step === 7} width={3} />
      <Arrow show={step >= 8} from={[colX(4) - 6, BOT_MID]} to={[colX(2) + W + 8, BOT_MID]} tone="ctrl" flow={step === 8} width={3} />
      <Arrow show={step >= 8} from={[colX(2) - 6, BOT_MID]} to={[colX(0) + W + 8, BOT_MID]} tone={T.app} flow={step === 8} width={3} />

      {NODES.map((n) => {
        const hiddenBottom = n.y === BOT_Y && step < 7;
        return (
          <Reveal key={n.key} show={!hiddenBottom} from="none">
            <FlowNode
              tone={n.tone}
              icon={n.icon}
              title={n.title}
              sub={n.sub}
              state={stateOf(n, step)}
              style={{ left: colX(n.col), top: n.y, width: W, height: H }}
            />
          </Reveal>
        );
      })}

      {/* Ответ на REST уходит сразу, не дожидаясь чайника */}
      <Reveal show={step >= 4} from="scale" className="absolute" style={{ left: 0, top: H + 18 }}>
        <Chip tone={T.app} solid={step === 4}>
          202 Accepted
        </Chip>
      </Reveal>

      <InfoPacket at={p.at} tone={packetTone} k={step} label={p.label} lines={p.lines} />

      <StepCaption
        step={step}
        tone={packetTone}
        captions={[
          'Нажали «90°»: приложение шлёт обычный POST с токеном',
          'Guard: тот же JWT, что и в магазине — userId из токена',
          'Контроллер тонкий: адрес + тело → команда в шину',
          <>
            Хендлер: <b>мой ли это чайник</b> и разумная ли температура. Записали desired
          </>,
          <>
            MqttService публикует в <M>{TOPIC.set}</M>. Приложению — сразу 202
          </>,
          'Брокер доставляет команду по соединению, которое держит чайник',
          'Чайник включил реле и сообщает новое состояние',
          'Бэкенд получил состояние: обновил reported, записал показание',
          'По WebSocket — всем, у кого открыто приложение этого дома',
        ]}
      />
    </SlideLayout>
  );
}
