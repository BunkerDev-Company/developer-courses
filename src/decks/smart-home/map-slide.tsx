'use client';

import { Cloud, Home, Radio, Router, Server, Smartphone } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { Tile, Zone } from '../what-is-backend/parts';
import { KETTLE_ID, T } from './data';
import { Badge, KettleIcon } from './parts';

/**
 * Шаги:
 * 0 — нажал в приложении → чайник закипел. Что между ними?
 * 1 — чайник в домашнем Wi-Fi, за роутером
 * 2 — между ними бэкенд и брокер; чайник сам подключается к брокеру
 * 3 — план лекции: ① устройство ② связь ③ бэкенд
 */

const TOP = 170;
const MID = TOP + 112; // центр плиток по высоте (Tile md ≈ 224 px)
const X = { phone: 0, backend: 262, broker: 542, router: 862, kettle: 1192 } as const;
const W = { phone: 200, backend: 220, broker: 220, router: 210, kettle: 210 } as const;
const right = (k: keyof typeof X) => X[k] + W[k];

export function MapSlide({ step }: SlideProps) {
  const home = step >= 1;
  const cloud = step >= 2;

  return (
    <SlideLayout section="intro" title="Нажал — чайник закипел. Как?">
      <Reveal show={cloud} from="none" className="absolute inset-0">
        <Zone label="Облако — серверы в интернете" icon={Cloud} tone={T.backend} dashed style={{ left: 236, top: 40, width: 552, height: 440 }} />
      </Reveal>
      <Reveal show={home} from="none" className="absolute inset-0">
        <Zone label="Квартира" icon={Home} tone={T.device} style={{ left: 832, top: 40, width: 608, height: 440 }} />
      </Reveal>

      <Tile tone={T.app} icon={Smartphone} title="Телефон" sub="приложение" className="absolute" style={{ left: X.phone, top: TOP, width: W.phone }} />
      <Tile
        tone={T.device}
        icon={KettleIcon}
        title="Чайник"
        sub={KETTLE_ID}
        state={step === 1 ? 'active' : 'idle'}
        className="absolute"
        style={{ left: X.kettle, top: TOP, width: W.kettle }}
      />
      <Reveal show={home} className="absolute" style={{ left: X.router, top: TOP, width: W.router }}>
        <Tile tone={T.net} icon={Router} title="Роутер" sub="Wi-Fi" />
      </Reveal>
      <Reveal show={cloud} className="absolute" style={{ left: X.backend, top: TOP, width: W.backend }}>
        <Tile tone={T.backend} icon={Server} title="Бэкенд" sub="NestJS" state={step === 2 ? 'active' : 'idle'} />
      </Reveal>
      <Reveal show={cloud} delay={0.15} className="absolute" style={{ left: X.broker, top: TOP, width: W.broker }}>
        <Tile tone={T.broker} icon={Radio} title="Брокер" sub="MQTT" state={step === 2 ? 'active' : 'idle'} />
      </Reveal>

      {/* Шаг 0: «как?» — дугой над всем */}
      <Arrow
        show={step === 0}
        from={[X.phone + W.phone / 2, TOP - 8]}
        to={[X.kettle + W.kettle / 2, TOP - 8]}
        curve={-150}
        dashed
        tone={T.app}
        width={3}
        label="?"
      />

      {/* Шаг 1+: чайник ↔ роутер */}
      <Arrow show={home} from={[X.kettle - 6, MID]} to={[right('router') + 8, MID]} tone={T.device} width={3} label="Wi-Fi" labelOffset={[0, -36]} />
      {/* Шаг 2+: облако */}
      <Arrow show={cloud} from={[right('phone') + 4, MID]} to={[X.backend - 6, MID]} tone={T.app} width={3} />
      <Arrow show={cloud} from={[right('backend') + 4, MID]} to={[X.broker - 6, MID]} tone={T.backend} width={3} delay={0.2} />
      <Arrow
        show={cloud}
        from={[X.router - 6, MID]}
        to={[right('broker') + 8, MID]}
        tone={T.device}
        width={3}
        flow={step === 2}
        delay={0.35}
        label="чайник звонит сам"
        labelOffset={[-30, 150]}
      />

      {/* Шаг 3: план лекции */}
      <Reveal show={step === 3} from="scale" className="absolute" style={{ left: X.kettle + W.kettle - 30, top: TOP - 22 }}>
        <Badge n={1} tone={T.device} />
      </Reveal>
      <Reveal show={step === 3} from="scale" delay={0.15} className="absolute" style={{ left: X.broker + W.broker - 30, top: TOP - 22 }}>
        <Badge n={2} tone={T.broker} />
      </Reveal>
      <Reveal show={step === 3} from="scale" delay={0.3} className="absolute" style={{ left: X.backend + W.backend - 30, top: TOP - 22 }}>
        <Badge n={3} tone={T.backend} />
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 0 ? T.app : step === 1 ? T.device : step === 2 ? T.broker : T.backend}
        captions={[
          'Нажал в приложении — чайник закипел. Что между ними?',
          'Чайник подключён к домашнему Wi-Fi — как ноутбук или телевизор',
          'Между ними — бэкенд и брокер сообщений. К брокеру чайник подключается сам',
          'Сегодня по порядку: ① устройство ② связь ③ бэкенд',
        ]}
      />
    </SlideLayout>
  );
}
