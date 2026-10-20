'use client';

import { Code } from '@/components/ui/code';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import type { Tone } from '@/lib/tones';
import type { SlideProps } from '@/types';
import { T } from './data';

/**
 * Эмулятор чайника на mqtt.js — всё, что было про MQTT, в 16 строках.
 * Этот код запускался как есть (mqtt.js 5.16 + брокер на localhost:1883): вывод — на следующем слайде.
 * Шаги: 0 подключение с завещанием, 1 «я онлайн» + подписка на команды, 2 приём команды, 3 цикл: греть и публиковать.
 */

const EMULATOR = `import mqtt from 'mqtt';
const id = 'kettle-1';
const client = mqtt.connect('mqtt://localhost:1883', {
  will: { topic: \`dev/\${id}/availability\`, payload: 'offline', qos: 1, retain: true },
});
let state = { power: 'off', temperature: 20, target: 100 };
client.on('connect', () => {
  client.publish(\`dev/\${id}/availability\`, 'online', { qos: 1, retain: true });
  client.subscribe(\`dev/\${id}/set\`, { qos: 1 });
});
client.on('message', (_t, payload) => (state = { ...state, ...JSON.parse(payload.toString()) }));
setInterval(() => {
  if (state.power === 'on') state.temperature += 10;
  if (state.temperature >= state.target) state.power = 'off';
  client.publish(\`dev/\${id}/state\`, JSON.stringify(state), { qos: 1, retain: true });
}, 1000);`;

const HL: { lines: number[]; tone: Tone }[] = [
  { lines: [3, 4, 5], tone: 'danger' },
  { lines: range(7, 10), tone: 'success' },
  { lines: [11], tone: T.backend },
  { lines: range(12, 16), tone: T.device },
];

export function EmulatorSlide({ step }: SlideProps) {
  const hl = HL[step] ?? HL[0];
  return (
    <SlideLayout section="outro" title="Чайник за 16 строк">
      <Code code={EMULATOR} lang="ts" size="sm" title="kettle.mjs — эмулятор (npm i mqtt)" hl={hl.lines} tone={hl.tone} className="absolute" style={{ left: 0, top: 0, width: 1440 }} />
      <StepCaption
        step={step}
        tone={hl.tone}
        captions={[
          'Подключаемся и сразу оставляем завещание: «если пропаду — offline»',
          'Подключились: «я online» (retained) и подписка на свои команды',
          'Пришла команда — смешали её с текущим состоянием',
          'Раз в секунду: греем и публикуем состояние (retained)',
        ]}
      />
    </SlideLayout>
  );
}
