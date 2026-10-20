'use client';

import { Eye, Radio, Server } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { SET_JSON, STATE_JSON, T, TOPIC } from './data';
import { KettleIcon, MqttMsg } from './parts';

/**
 * Шаги:
 * 0 — все говорят только с брокером, напрямую — никто
 * 1 — чайник публикует состояние → брокер раздаёт всем, кто подписан
 * 2 — бэкенд публикует команду → брокер отдаёт чайнику (он подписан на set)
 * 3 — подписки: топики — как пути, + и # — шаблоны
 */

const BROKER = { left: 470, top: 20, width: 500 };
const ROW0 = BROKER.top + 64 + 28; // центр первой строки топиков
const ROW_H = 56;
const rowY = (i: number) => ROW0 + i * ROW_H;
const TOPICS = [TOPIC.state, TOPIC.set, TOPIC.availability];

const KETTLE = { left: 0, top: 110, width: 330 };
const BACKEND = { left: 1110, top: 40, width: 330 };
const EXPLORER = { left: 1110, top: 210, width: 330 };
const H = 88;
const cy = (b: { top: number }) => b.top + H / 2;

export function MqttSlide({ step }: SlideProps) {
  const rowOn = (i: number) => (step === 1 && i === 0) || (step === 2 && i === 1);
  const quiet = (on: boolean) => (step === 0 || step === 3 ? 'muted' : on ? T.broker : 'muted');

  return (
    <SlideLayout section="protocols" title="MQTT: брокер и подписки">
      {/* Брокер с топиками */}
      <div className={cn('card absolute overflow-hidden', TONE[T.broker].border, step === 0 && TONE[T.broker].ring)} style={{ ...BROKER, height: 64 + ROW_H * 3 + 16 }}>
        <div className={cn('flex items-center gap-3 border-b-2 border-border px-5', TONE[T.broker].soft)} style={{ height: 64 }}>
          <Radio size={28} className={TONE[T.broker].text} />
          <span className="text-[26px] font-bold">Брокер</span>
          <span className="ml-auto font-mono text-[18px] text-text-2">Mosquitto</span>
        </div>
        <div className="py-2">
          {TOPICS.map((t, i) => (
            <div
              key={t}
              className={cn('relative flex items-center px-5 font-mono text-[20px] transition-colors duration-300', rowOn(i) && cn(TONE[T.broker].soft, 'font-semibold'))}
              style={{ height: ROW_H }}
            >
              {rowOn(i) && <span className={cn('absolute inset-y-0 left-0 w-1.5', TONE[T.broker].bg)} />}
              {t}
            </div>
          ))}
        </div>
      </div>

      <NodeBox tone={T.device} icon={KettleIcon} title="Чайник" sub="публикует и слушает" state={step === 1 ? 'active' : 'idle'} className="absolute" style={KETTLE} />
      <NodeBox tone={T.backend} icon={Server} title="Бэкенд" sub="NestJS" state={step === 2 ? 'active' : 'idle'} className="absolute" style={BACKEND} />
      <NodeBox tone={T.app} icon={Eye} title="MQTT Explorer" sub="подсмотреть всё" className="absolute" style={EXPLORER} />

      {/* Шаг 0: все подключены к брокеру */}
      <Arrow show={step === 0 || step === 3} from={[KETTLE.left + KETTLE.width + 6, cy(KETTLE)]} to={[BROKER.left - 8, cy(KETTLE)]} tone="muted" width={3} />
      <Arrow show={step === 0 || step === 3} from={[BACKEND.left - 6, cy(BACKEND)]} to={[BROKER.left + BROKER.width + 8, cy(BACKEND)]} tone="muted" width={3} />
      <Arrow show={step === 0 || step === 3} from={[EXPLORER.left - 6, cy(EXPLORER)]} to={[BROKER.left + BROKER.width + 8, cy(EXPLORER)]} tone="muted" width={3} />

      {/* Шаг 1: состояние — от чайника всем подписчикам */}
      <Arrow show={step === 1} from={[KETTLE.left + KETTLE.width + 6, cy(KETTLE) - 10]} to={[BROKER.left - 8, rowY(0)]} tone={T.device} width={3} flow />
      <Arrow show={step === 1} from={[BROKER.left + BROKER.width + 6, rowY(0)]} to={[BACKEND.left - 8, cy(BACKEND)]} tone={quiet(true)} width={3} flow delay={0.3} />
      <Arrow show={step === 1} from={[BROKER.left + BROKER.width + 6, rowY(0) + 10]} to={[EXPLORER.left - 8, cy(EXPLORER)]} tone={quiet(true)} width={3} flow delay={0.4} />

      {/* Шаг 2: команда — от бэкенда чайнику */}
      <Arrow show={step === 2} from={[BACKEND.left - 6, cy(BACKEND) + 10]} to={[BROKER.left + BROKER.width + 8, rowY(1)]} tone={T.backend} width={3} flow />
      <Arrow show={step === 2} from={[BROKER.left - 6, rowY(1)]} to={[KETTLE.left + KETTLE.width + 8, cy(KETTLE) + 10]} tone={quiet(true)} width={3} flow delay={0.3} />

      {/* Шаг 3: кто на что подписан */}
      <Reveal show={step === 3} className="absolute" style={{ left: KETTLE.left, top: KETTLE.top + H + 14 }}>
        <Chip tone={T.device}>{TOPIC.set}</Chip>
      </Reveal>
      <Reveal show={step === 3} delay={0.1} className="absolute" style={{ left: BACKEND.left, top: BACKEND.top + H + 10 }}>
        <Chip tone={T.backend}>dev/+/state</Chip>
      </Reveal>
      <Reveal show={step === 3} delay={0.2} className="absolute" style={{ left: EXPLORER.left, top: EXPLORER.top + H + 14 }}>
        <Chip tone={T.app}>dev/#</Chip>
      </Reveal>

      {/* Низ: сообщение или шаблоны подписок */}
      <div className="absolute" style={{ left: 230, top: 370, width: 980 }}>
        <Swap k={step}>
          {step === 1 && <MqttMsg topic={TOPIC.state} payload={STATE_JSON} flags={['QoS 1', 'retain']} tone={T.device} />}
          {step === 2 && <MqttMsg topic={TOPIC.set} payload={SET_JSON} flags={['QoS 1']} tone={T.backend} />}
          {step === 3 && (
            <div className="card grid grid-cols-2 gap-6 px-6 py-4 text-[22px]">
              <span>
                <M>+</M> — одно любое слово: <M>dev/+/state</M> — состояние всех устройств
              </span>
              <span>
                <M>#</M> — всё дальше: <M>dev/#</M> — вообще всё про устройства
              </span>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 1 ? T.device : step === 2 ? T.backend : T.broker}
        captions={[
          'Напрямую никто ни с кем не говорит — только через брокер',
          'Чайник публикует состояние — брокер раздаёт всем, кто подписан',
          'Бэкенд публикует команду в set — её получает только чайник',
          'Топики — как пути в файловой системе. + и # — шаблоны подписки',
        ]}
      />
    </SlideLayout>
  );
}
