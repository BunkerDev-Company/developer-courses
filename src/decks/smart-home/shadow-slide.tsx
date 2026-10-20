'use client';

import { CircleCheck, Flame, Smartphone } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { KETTLE_ID, T, TOPIC } from './data';
import { KettleIcon, MqttMsg } from './parts';

/**
 * Шаги:
 * 0 — команда записала desired, а чайник оффлайн: не дошло
 * 1 — чайник снова online → бэкенд досылает desired
 * 2 — reported догоняет: греется, 63°; в приложении — reported
 * 3 — reported совпал с целью: готово
 */

const DESIRED = `{
  "power": "on",
  "target": 90
}`;

const REPORTED = [
  `{\n  "power": "off",\n  "temperature": 21\n}`,
  `{\n  "power": "off",\n  "temperature": 21\n}`,
  `{\n  "power": "on",\n  "temperature": 63\n}`,
  `{\n  "power": "off",\n  "temperature": 90\n}`,
];

const PANEL_W = 440;
const KETTLE = { left: 560, top: 64, width: 320 };
const PANEL_TOP = 30;
const ROW_Y = PANEL_TOP + 45 + 16 + 1.5 * 19 * 1.55; // середина панели JSON

export function ShadowSlide({ step }: SlideProps) {
  const online = step >= 1;
  const done = step === 3;

  return (
    <SlideLayout section="backend" title="desired и reported">
      <Code
        code={DESIRED}
        lang="json"
        size="sm"
        title={<span className="font-sans text-[18px] font-semibold text-code-text">desired — что хотим · пишет бэкенд</span>}
        hl={step === 1 ? [2, 3] : undefined}
        tone={T.backend}
        className="absolute"
        style={{ left: 0, top: PANEL_TOP, width: PANEL_W }}
      />
      <Code
        code={REPORTED[step]}
        lang="json"
        size="sm"
        title={<span className="font-sans text-[18px] font-semibold text-code-text">reported — что есть · пишет чайник</span>}
        hl={step >= 2 ? [2, 3] : undefined}
        tone={done ? 'success' : T.device}
        className="absolute"
        style={{ left: 1440 - PANEL_W, top: PANEL_TOP, width: PANEL_W }}
      />

      <NodeBox tone={T.device} icon={KettleIcon} title="Чайник" sub={KETTLE_ID} state={online ? 'active' : 'dim'} className="absolute" style={KETTLE} />
      <div className="absolute flex justify-center" style={{ left: KETTLE.left, top: KETTLE.top + 110, width: KETTLE.width }}>
        <Swap k={online ? 'on' : 'off'}>
          <Chip tone={online ? 'success' : 'danger'} solid>
            {online ? 'online' : 'offline'}
          </Chip>
        </Swap>
      </div>

      <Arrow
        from={[PANEL_W + 8, ROW_Y]}
        to={[KETTLE.left - 8, KETTLE.top + 44]}
        tone={online ? T.backend : 'danger'}
        dashed={!online}
        flow={step === 1}
        width={3}
        label={online ? 'дослали' : 'не дошло'}
        labelOffset={[-36, -36]}
      />
      <Arrow show={step >= 2} from={[KETTLE.left + KETTLE.width + 6, KETTLE.top + 44]} to={[1440 - PANEL_W - 8, ROW_Y]} tone={T.device} flow={step === 2} width={3} />

      {/* Низ: что видно в приложении / сообщение online */}
      <div className="absolute" style={{ left: 220, top: 330, width: 1000 }}>
        <Swap k={step}>
          {step === 0 && (
            <div className="card px-6 py-5 text-[24px] leading-snug">
              Команда не потерялась: <M>desired</M> лежит в базе и ждёт
            </div>
          )}
          {step === 1 && <MqttMsg topic={TOPIC.availability} payload="online" flags={['retain']} tone="success" />}
          {step >= 2 && (
            <div className={cn('card flex items-center gap-6 px-8 py-6', done ? TONE.success.border : TONE[T.device].borderSoft)}>
              <Smartphone size={44} className="shrink-0 text-client" />
              <span className="text-[60px] font-extrabold leading-none tabular-nums">{done ? '90°' : '63°'}</span>
              <span className={cn('flex items-center gap-2 text-[28px] font-semibold', done ? 'text-success' : 'text-warning')}>
                {done ? <CircleCheck size={30} /> : <Flame size={30} />}
                {done ? 'Вскипел' : 'Греется до 90°'}
              </span>
              <span className="ml-auto text-[20px] text-text-2">на экране — reported</span>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 0 ? 'danger' : step === 1 ? 'success' : done ? 'success' : T.device}
        captions={[
          'Команда записала desired, а чайник оффлайн — до него не дошло',
          'Чайник снова в сети — бэкенд видит online и досылает desired',
          'reported догоняет: в приложении показываем то, что ЕСТЬ, а не что хотим',
          'reported совпал с целью — готово',
        ]}
      />
    </SlideLayout>
  );
}
