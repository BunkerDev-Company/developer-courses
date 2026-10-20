'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Cpu, Ear, Send, Thermometer } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import type { Tone } from '@/lib/tones';
import type { SlideProps } from '@/types';
import { T, TOPIC } from './data';

/**
 * Шаги:
 * 0 — прошивка: один бесконечный цикл loop()
 * 1 — читает датчик; 2 — решает, выключить ли реле; 3 — раз в 10 с шлёт состояние;
 * 4 — mqtt.loop() принимает команды → onCommand
 */

// Arduino + PubSubClient (ESP32). readTemperature() и stateJson() — свои функции прошивки.
const FIRMWARE = `void loop() {
  float t = readTemperature();          // датчик
  if (heating && t >= target) {
    digitalWrite(RELAY_PIN, LOW);       // реле: выкл
    heating = false;
  }
  if (millis() - lastReport > 10000) {  // раз в 10 с
    mqtt.publish("${TOPIC.state}", stateJson());
    lastReport = millis();
  }
  mqtt.loop();                          // принять команды
}

void onCommand(char* topic, byte* msg, unsigned int len) {
  // {"target":90} → target = 90; heating = true;
}`;

const C = { x: 330, y: 270 };
const R = 190;
const NODE_W = 262;
const NODE_H = 68;

const NODES: { title: string; icon: LucideIcon; tone: Tone; at: [number, number]; lines: number[] }[] = [
  { title: 'Читает датчик', icon: Thermometer, tone: T.db, at: [C.x, C.y - R], lines: [2] },
  { title: 'Решает: греть?', icon: Cpu, tone: T.device, at: [C.x + R, C.y], lines: range(3, 6) },
  { title: 'Шлёт состояние', icon: Send, tone: T.broker, at: [C.x, C.y + R], lines: range(7, 10) },
  { title: 'Слушает команды', icon: Ear, tone: T.broker, at: [C.x - R, C.y], lines: [11, 14, 15, 16] },
];

export function FirmwareSlide({ step }: SlideProps) {
  const active = step >= 1 ? NODES[step - 1] : null;

  return (
    <SlideLayout section="devices" title="Прошивка: вечный цикл">
      {/* Кольцо цикла */}
      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
        <circle cx={C.x} cy={C.y} r={R} fill="none" strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" className="stroke-border-2" />
      </svg>
      <motion.div
        className="absolute"
        style={{ left: C.x, top: C.y, width: 0, height: 0 }}
        initial={false}
        animate={step === 0 ? { rotate: 360, opacity: 1 } : { rotate: 0, opacity: 0 }}
        transition={step === 0 ? { rotate: { duration: 4, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.3 } } : { duration: 0.3 }}
      >
        <span className="absolute h-6 w-6 rounded-full bg-warning shadow-[0_0_0_8px_rgb(var(--c-warning)/0.25)]" style={{ left: R - 12, top: -12 }} />
      </motion.div>
      <div className="absolute text-center font-mono text-[26px] font-bold text-warning" style={{ left: C.x - 100, top: C.y - 18, width: 200 }}>
        loop()
      </div>

      {NODES.map((n) => (
        <NodeBox
          key={n.title}
          tone={n.tone}
          icon={n.icon}
          title={n.title}
          size="sm"
          state={active ? (active === n ? 'active' : 'dim') : 'idle'}
          className="absolute"
          style={{ left: n.at[0] - NODE_W / 2, top: n.at[1] - NODE_H / 2, width: NODE_W }}
        />
      ))}

      <Code
        code={FIRMWARE}
        lang="ts"
        size="sm"
        title="kettle.ino — прошивка (Arduino)"
        hl={active?.lines}
        tone={active?.tone ?? T.device}
        className="absolute"
        style={{ left: 700, top: 0, width: 740 }}
      />

      <StepCaption
        step={step}
        tone={active?.tone ?? T.device}
        captions={[
          'Прошивка — один бесконечный цикл: снова и снова, пока чайник в розетке',
          'Прочитать датчик температуры',
          'Вода дошла до цели — выключить реле. Решает сам чайник, без сервера',
          'Раз в 10 секунд — отправить своё состояние',
          <>
            <M>mqtt.loop()</M> принимает команды — их разбирает <M>onCommand</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}

