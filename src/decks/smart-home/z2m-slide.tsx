'use client';

import type { LucideIcon } from 'lucide-react';
import { Lightbulb, Radio, Server, Usb, Workflow } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { Tone } from '@/lib/tones';
import type { SlideProps } from '@/types';
import { T, TOPIC } from './data';
import { MqttMsg } from './parts';

/**
 * Шаги:
 * 0 — Zigbee-лампа сама в интернет не умеет: стик → Zigbee2MQTT → брокер
 * 1 — состояние: zigbee2mqtt/<имя>; 2 — команда: …/set; 3 — онлайн: …/availability (retained)
 * Топики и тела — из документации Zigbee2MQTT («MQTT Topics and Messages», «Device availability»).
 */

const CHAIN: { title: string; sub: string; icon: LucideIcon; tone: Tone; link?: string }[] = [
  { title: 'Лампа', sub: 'Zigbee', icon: Lightbulb, tone: 'git', link: 'Zigbee' },
  { title: 'USB-стик', sub: 'координатор', icon: Usb, tone: T.net, link: 'USB' },
  { title: 'Zigbee2MQTT', sub: 'переводчик', icon: Workflow, tone: T.broker, link: 'MQTT' },
  { title: 'Брокер', sub: 'Mosquitto', icon: Radio, tone: T.broker },
  { title: 'Бэкенд', sub: 'или Home Assistant', icon: Server, tone: T.backend },
];
const NODE_W = 256;
const NODE_STEP = (1440 - NODE_W) / 4;
const NODE_Y = 10;
const NODE_CY = NODE_Y + 38;

const NAME = 'kitchen_lamp';
const MSGS: { topic: string; payload: string; flags: string[]; what: string; who: string; ours: string }[] = [
  { topic: `zigbee2mqtt/${NAME}`, payload: '{"state":"ON","brightness":215,"color_temp":325}', flags: [], what: 'состояние', who: 'лампа → всем подписчикам', ours: TOPIC.state },
  { topic: `zigbee2mqtt/${NAME}/set`, payload: '{"state":"OFF"}', flags: [], what: 'команда', who: 'кто угодно → лампе', ours: TOPIC.set },
  { topic: `zigbee2mqtt/${NAME}/availability`, payload: '{"state":"offline"}', flags: ['retain'], what: 'онлайн', who: 'Zigbee2MQTT следит сам', ours: TOPIC.availability },
];
const MSG_TOP = 150;
const MSG_STEP = 132;
const MSG_W = 900;

export function Z2mSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="protocols" title="Живой пример: Zigbee2MQTT">
      {CHAIN.map((c, i) => (
        <NodeBox
          key={c.title}
          tone={c.tone}
          icon={c.icon}
          title={c.title}
          sub={c.sub}
          size="sm"
          state={step === 0 && i === 2 ? 'active' : 'idle'}
          className="absolute"
          style={{ left: i * NODE_STEP, top: NODE_Y, width: NODE_W }}
        />
      ))}
      {CHAIN.slice(0, -1).map((c, i) => (
        <Arrow
          key={c.title}
          from={[i * NODE_STEP + NODE_W + 4, NODE_CY]}
          to={[(i + 1) * NODE_STEP - 6, NODE_CY]}
          tone={c.link ? CHAIN[i + 1].tone : 'muted'}
          width={3}
          label={c.link}
          labelOffset={[0, 64]}
        />
      ))}

      {MSGS.map((m, i) => (
        <Reveal key={m.topic} show={step >= i + 1} from="left" className="absolute" style={{ left: 0, top: MSG_TOP + i * MSG_STEP, width: 1440 }}>
          <div className="flex items-center gap-8">
            <MqttMsg topic={m.topic} payload={m.payload} flags={m.flags} active={step === i + 1} style={{ width: MSG_W }} />
            <div className="min-w-0 flex-1">
              <div className="text-[26px] font-bold">{m.what}</div>
              <div className="text-[20px] text-text-2">{m.who}</div>
              <Reveal show={step === 3} delay={0.2 + i * 0.1} className="mt-1.5">
                <Chip tone={T.device} size="sm">
                  у чайника: {m.ours}
                </Chip>
              </Reveal>
            </div>
          </div>
        </Reveal>
      ))}

      <StepCaption
        step={step}
        tone={step === 0 ? T.broker : step === 3 ? T.device : T.broker}
        captions={[
          'Zigbee-лампа в интернет не умеет — её «переводит» Zigbee2MQTT',
          'Состояние: топик с именем устройства, внутри всегда JSON',
          'Команда: тот же топик + /set — лампа выключится',
          'Онлайн — отдельный retained-топик. Тот же шаблон, что у нашего чайника',
        ]}
      />
    </SlideLayout>
  );
}
