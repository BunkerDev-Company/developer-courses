'use client';

import { Cpu, Flame, Power, Thermometer, ToggleRight, Wifi } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';
import { T } from './data';

/**
 * Шаги — собираем умный чайник из обычного:
 * 0 — обычный: кнопка замыкает 220 В на нагреватель
 * 1 — кнопку заменяет реле, на дне — датчик температуры
 * 2 — микроконтроллер: читает датчик, управляет реле (прошивка)
 * 3 — радиомодуль: выход в сеть; в ESP32 Wi-Fi и Bluetooth уже в чипе
 */

const ROW = 60;
const H = 88;
const MID = ROW + H / 2;
const X = { radio: 0, mcu: 363, relay: 796, heater: 1160 } as const;
const W = { radio: 280, mcu: 350, relay: 280, heater: 280 } as const;
const SENSOR = { left: 1160, top: 300, width: 280 };
const NET = { left: 0, top: 300 };

export function KettleSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="devices" title="Что внутри умного чайника">
      {/* Кнопка → реле */}
      <div className="absolute" style={{ left: X.relay, top: ROW, width: W.relay }}>
        <Swap k={step === 0 ? 'button' : 'relay'}>
          {step === 0 ? (
            <NodeBox tone={T.net} icon={Power} title="Кнопка" sub="механическая" state="active" />
          ) : (
            <NodeBox tone={T.device} icon={ToggleRight} title="Реле" sub="вкл/выкл 220 В" state={step === 1 || step === 2 ? 'active' : 'idle'} />
          )}
        </Swap>
      </div>
      <NodeBox tone="danger" icon={Flame} title="Нагреватель" sub="2 кВт" className="absolute" style={{ left: X.heater, top: ROW, width: W.heater }} />
      <Arrow from={[X.relay + W.relay + 4, MID]} to={[X.heater - 6, MID]} tone="danger" width={3} flow={step === 0} />

      {/* Датчик температуры */}
      <Reveal show={step >= 1} className="absolute" style={SENSOR}>
        <NodeBox tone={T.db} icon={Thermometer} title="Датчик t°" sub="термистор" state={step === 1 ? 'active' : 'idle'} />
      </Reveal>
      <Arrow show={step >= 1} from={[SENSOR.left + SENSOR.width / 2, SENSOR.top - 6]} to={[X.heater + W.heater / 2, ROW + H + 8]} tone={T.db} width={3} dashed label="меряет воду" labelOffset={[90, 0]} />

      {/* Микроконтроллер */}
      <Reveal show={step >= 2} className="absolute" style={{ left: X.mcu, top: ROW, width: W.mcu }}>
        <NodeBox tone={T.device} icon={Cpu} title="Микроконтроллер" sub="прошивка" state={step === 2 ? 'active' : 'idle'} />
      </Reveal>
      <Arrow show={step >= 2} from={[X.mcu + W.mcu + 4, MID]} to={[X.relay - 6, MID]} tone={T.device} width={3} flow={step === 2} delay={0.2} />
      <Arrow
        show={step >= 2}
        from={[SENSOR.left - 6, SENSOR.top + H / 2]}
        to={[X.mcu + W.mcu / 2, ROW + H + 8]}
        curve={60}
        tone={T.db}
        width={3}
        flow={step === 2}
        delay={0.3}
        label="°C"
      />

      {/* Радиомодуль и выход в сеть */}
      <Reveal show={step >= 3} className="absolute" style={{ left: X.radio, top: ROW, width: W.radio }}>
        <NodeBox tone={T.broker} icon={Wifi} title="Радиомодуль" sub="Wi-Fi / Zigbee" state={step === 3 ? 'active' : 'idle'} />
      </Reveal>
      <Arrow show={step >= 3} from={[X.mcu - 6, MID - 14]} to={[X.radio + W.radio + 6, MID - 14]} tone={T.broker} width={3} delay={0.2} />
      <Arrow show={step >= 3} from={[X.radio + W.radio + 4, MID + 14]} to={[X.mcu - 8, MID + 14]} tone={T.broker} width={3} delay={0.3} />
      <Arrow show={step >= 3} from={[X.radio + W.radio / 2, ROW + H + 8]} to={[X.radio + W.radio / 2, NET.top - 8]} tone={T.broker} width={3} delay={0.4} />
      <Reveal show={step >= 3} delay={0.4} className="absolute" style={NET}>
        <Pill tone={T.broker} icon={Wifi}>
          в сеть: состояние ↑ команды ↓
        </Pill>
      </Reveal>

      <Reveal show={step >= 3} delay={0.6} className="absolute" style={{ left: 363, top: 440, width: 760 }}>
        <div className="card flex items-center gap-4 px-6 py-4">
          <Cpu size={30} className="shrink-0 text-warning" />
          <span className="text-[24px]">
            Часто МК и радио — один чип: в <b>ESP32</b> Wi-Fi и Bluetooth уже внутри
          </span>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 0 ? 'danger' : step === 1 ? T.db : step === 2 ? T.device : T.broker}
        captions={[
          'Обычный чайник: кнопка замыкает 220 В на нагреватель',
          'Кнопку заменяет реле — «кнопка», которую нажимает электроника',
          'Микроконтроллер читает датчик и сам решает, когда выключить реле',
          'Радиомодуль выводит чайник в сеть: наружу состояние, внутрь команды',
        ]}
      />
    </SlideLayout>
  );
}
