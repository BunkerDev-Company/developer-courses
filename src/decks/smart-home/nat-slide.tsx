'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeftRight, Cloud, Home, PlugZap, Radio, Router, Server, ShieldBan, X } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Zone } from '../what-is-backend/parts';
import { KETTLE_ID, T } from './data';
import { KettleIcon } from './parts';

/**
 * Шаги:
 * 0 — бэкенд хочет достучаться до 192.168.1.37 — из интернета этот адрес не виден
 * 1 — роутер (NAT) пускает внутрь только ответы на соединения изнутри
 * 2 — чайник сам открывает соединение к брокеру и держит его
 * 3 — команды идут обратно по тому же соединению; keepalive не даёт ему закрыться
 */

const BACKEND = { left: 30, top: 70, width: 400 };
const BROKER = { left: 30, top: 340, width: 400 };
const ROUTER = { left: 540, top: 190, width: 330 };
const KETTLE = { left: 970, top: 190, width: 430 };
const H = 88;
const cy = (b: { top: number }) => b.top + H / 2;

const NOTES: { icon: LucideIcon; tone: Tone; text: string }[] = [
  { icon: X, tone: 'danger', text: 'connect 192.168.1.37 — в интернете такого адреса нет' },
  { icon: ShieldBan, tone: 'danger', text: 'Внутрь — только ответы на то, что открыли изнутри' },
  { icon: PlugZap, tone: T.device, text: 'Чайник сам открыл соединение наружу' },
  { icon: ArrowLeftRight, tone: T.broker, text: 'Команда — по тому же соединению' },
];

export function NatSlide({ step }: SlideProps) {
  const linked = step >= 2;
  const note = NOTES[step] ?? NOTES[0];

  return (
    <SlideLayout section="protocols" title="Почему сервер не звонит чайнику">
      <Zone label="Интернет" icon={Cloud} tone={T.backend} dashed style={{ left: 0, top: 0, width: 470, height: 470 }} />
      <Zone label="Квартира" icon={Home} tone={T.device} style={{ left: 930, top: 0, width: 510, height: 470 }} />

      <NodeBox tone={T.backend} icon={Server} title="Бэкенд" sub="NestJS" state={step === 0 ? 'active' : 'idle'} className="absolute" style={BACKEND} />
      <NodeBox tone={T.broker} icon={Radio} title="Брокер MQTT" sub="broker:8883" state={step >= 2 ? 'active' : 'idle'} className="absolute" style={BROKER} />
      <NodeBox tone={T.net} icon={Router} title="Роутер" sub="NAT · 203.0.113.7" state={step === 1 ? 'active' : 'idle'} className="absolute" style={ROUTER} />
      <NodeBox tone={T.device} icon={KettleIcon} title="Чайник" sub={`${KETTLE_ID} · 192.168.1.37`} state={step === 2 ? 'active' : 'idle'} className="absolute" style={KETTLE} />

      {/* Шаги 0–1: попытка позвонить внутрь — упирается в роутер */}
      <Arrow show={step <= 1} from={[BACKEND.left + BACKEND.width + 6, cy(BACKEND)]} to={[ROUTER.left - 10, cy(ROUTER) - 16]} tone="danger" dashed width={3} />
      <motion.div
        className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-danger text-white shadow-card"
        style={{ left: ROUTER.left - 34, top: cy(ROUTER) - 44 }}
        initial={false}
        animate={{ scale: step <= 1 ? 1 : 0, opacity: step <= 1 ? 1 : 0 }}
        transition={{ duration: 0.3, delay: step <= 1 ? 0.5 : 0 }}
      >
        <X size={26} strokeWidth={3} />
      </motion.div>

      {/* Шаг 2+: соединение изнутри наружу */}
      <Arrow show={linked} from={[KETTLE.left - 6, cy(KETTLE) - 14]} to={[ROUTER.left + ROUTER.width + 8, cy(ROUTER) - 14]} tone={T.device} width={4} flow={step === 2} />
      <Arrow show={linked} from={[ROUTER.left - 6, cy(ROUTER) + 4]} to={[BROKER.left + BROKER.width + 8, cy(BROKER) - 14]} tone={T.device} width={4} flow={step === 2} delay={0.3} />

      {/* Шаг 3: команда — обратно по тому же соединению */}
      <Arrow show={step === 3} from={[BROKER.left + BROKER.width + 6, cy(BROKER) + 14]} to={[ROUTER.left - 8, cy(ROUTER) + 32]} tone={T.broker} width={3} flow delay={0.1} />
      <Arrow show={step === 3} from={[ROUTER.left + ROUTER.width + 6, cy(ROUTER) + 16]} to={[KETTLE.left - 8, cy(KETTLE) + 16]} tone={T.broker} width={3} flow delay={0.3} />
      <Reveal show={step === 3} delay={0.4} className="absolute" style={{ left: KETTLE.left, top: KETTLE.top + H + 26 }}>
        <Chip tone={T.broker}>keepalive: пинг раз в 60 с</Chip>
      </Reveal>

      {/* Под роутером — что сейчас происходит */}
      <div className="absolute" style={{ left: ROUTER.left - 20, top: ROUTER.top + H + 40, width: ROUTER.width + 40 }}>
        <Swap k={step}>
          <div className={cn('card flex items-start gap-3 px-5 py-4', TONE[note.tone].borderSoft)}>
            <note.icon size={28} className={cn('mt-0.5 shrink-0', TONE[note.tone].text)} />
            <span className="text-[22px] leading-snug">{note.text}</span>
          </div>
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step <= 1 ? 'danger' : step === 2 ? T.device : T.broker}
        captions={[
          '192.168.1.37 — адрес внутри квартиры. Из интернета его не видно',
          'Роутер пускает внутрь только ответы на соединения, открытые изнутри',
          'Поэтому чайник сам подключается к брокеру — и не кладёт трубку',
          'Команды приходят по этому же соединению. Пинги не дают ему заснуть',
        ]}
      />
    </SlideLayout>
  );
}
