'use client';

import { GraduationCap } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import type { SlideProps } from '@/types';
import { SUB_OUTPUT, T } from './data';

/**
 * Шаги:
 * 0 — брокер в Docker (Mosquitto 2 без конфига снаружи контейнера не пускает → mosquitto-no-auth.conf)
 * 1 — эмулятор + подсматривающий подписчик: online и состояние
 * 2 — команда из CLI: чайник греется до 90° (вывод — реальный, см. SUB_OUTPUT)
 * 3 — домашка
 */

const COMMANDS = `# 1. брокер
docker run -it -p 1883:1883 eclipse-mosquitto \\
  mosquitto -c /mosquitto-no-auth.conf
# 2. чайник и подсматривающий
node kettle.mjs
npx mqtt sub -t 'dev/#' -v
# 3. команда
npx mqtt pub -t dev/kettle-1/set -q 1 \\
  -m '{"power":"on","target":90}'`;

const HL = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [],
];

function outputFor(step: number): TermLine[] {
  const n = step === 0 ? 0 : step === 1 ? 2 : SUB_OUTPUT.length;
  return SUB_OUTPUT.slice(0, n).map((text) => ({
    text,
    kind: text.includes('/set') ? 'ok' : text.includes('availability') ? 'dim' : 'out',
  }));
}

export function TrySlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Попробуйте сами">
      <Code code={COMMANDS} lang="bash" size="sm" title="три терминала" hl={HL[step]} tone={T.broker} className="absolute" style={{ left: 0, top: 0, width: 600 }} />

      <Terminal lines={outputFor(step)} title="npx mqtt sub -t 'dev/#' -v" className="absolute" style={{ left: 640, top: 0, width: 800, height: 420 }} />

      <Reveal show={step === 3} from="up" className="absolute" style={{ left: 0, top: 372, width: 600 }}>
        <div className="card flex flex-col gap-2 border-logic/50 px-6 py-4">
          <span className="flex items-center gap-3 text-[24px] font-bold">
            <GraduationCap size={28} className="text-logic" /> Домашка
          </span>
          <span className="text-[21px] leading-snug">MqttService в свой NestJS: подписка на dev/+/state и запись в базу</span>
          <span className="text-[21px] leading-snug">Вторая «лампа» по тому же шаблону топиков</span>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 3 ? T.backend : T.broker}
        captions={[
          'Брокер — одной командой в Docker',
          'Запустили чайник — подсматривающий сразу видит online и состояние',
          'Отправили команду из терминала — чайник греется до 90° и выключается',
          'Дальше — то же самое, только командует ваш бэкенд',
        ]}
      />
    </SlideLayout>
  );
}
