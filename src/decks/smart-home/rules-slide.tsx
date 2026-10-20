'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { BellRing, DoorOpen, Heater, Router, Server, Thermometer, Timer, TimerReset } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { T } from './data';

/**
 * Шаги:
 * 0 — правило: КОГДА (событие) → ЕСЛИ (условие) → ТО (действие); дверь открыта > 5 мин → push
 * 1 — второе правило: в комнате < 19° → включить обогреватель
 * 2 — расписание: @Cron раз в минуту → тот же SendDeviceCommand, что у кнопки в приложении
 * 3 — где живут правила: на бэкенде или в хабе (локально, без интернета)
 */

interface Part {
  label: string;
  icon: LucideIcon;
  tone: Tone;
  main: string;
  detail: string;
}

const RULES: Part[][] = [
  [
    { label: 'когда', icon: DoorOpen, tone: T.device, main: 'Дверь открылась', detail: '{"contact": false}' },
    { label: 'если', icon: Timer, tone: T.backend, main: 'дольше 5 минут', detail: 'и никого нет дома' },
    { label: 'то', icon: BellRing, tone: T.app, main: 'Push на телефон', detail: '«Дверь открыта»' },
  ],
  [
    { label: 'когда', icon: Thermometer, tone: T.device, main: 'Датчик прислал t°', detail: '{"temperature": 18.5}' },
    { label: 'если', icon: Timer, tone: T.backend, main: 'меньше 19°', detail: 'и сейчас не ночь' },
    { label: 'то', icon: Heater, tone: T.device, main: 'Обогреватель: вкл', detail: '{"state": "ON"}' },
  ],
];

const BLOCK_W = 420;
const BLOCK_H = 200;
const BLOCK_STEP = (1440 - BLOCK_W) / 2;

const CRON = `@Cron(CronExpression.EVERY_MINUTE)
async runSchedules() {
  const due = await this.schedules.dueNow(); // «будни, 07:00» — в поясе дома
  for (const s of due) {
    await this.commandBus.execute(new SendDeviceCommand(s.owner_id, s.device_id, s.target));
  }
}`;

function Block({ p }: { p: Part }) {
  const t = TONE[p.tone];
  return (
    <div className={cn('card flex h-full flex-col justify-center gap-3 border-t-[6px] px-6', t.border)}>
      <span className="text-[17px] font-semibold uppercase tracking-wider text-muted">{p.label}</span>
      <span className="flex items-center gap-3 text-[27px] font-bold leading-tight">
        <p.icon size={30} className={cn('shrink-0', t.text)} />
        {p.main}
      </span>
      <span className="font-mono text-[19px] text-text-2">{p.detail}</span>
    </div>
  );
}

function Where({ icon: Icon, tone, title, plus, minus }: { icon: LucideIcon; tone: Tone; title: string; plus: string; minus: string }) {
  const t = TONE[tone];
  return (
    <div className={cn('card flex flex-col gap-3 border-t-[6px] px-6 py-5', t.border)}>
      <span className="flex items-center gap-3 text-[27px] font-bold">
        <Icon size={30} className={t.text} /> {title}
      </span>
      <span className="text-[22px] leading-snug">
        <b className="text-success">+</b> {plus}
      </span>
      <span className="text-[22px] leading-snug">
        <b className="text-danger">−</b> {minus}
      </span>
    </div>
  );
}

export function RulesSlide({ step }: SlideProps) {
  const rule = RULES[step === 1 ? 1 : 0];

  return (
    <SlideLayout section="home" title="Автоматизации: если → то">
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: step >= 2 ? 0.35 : 1 }} transition={{ duration: 0.4 }}>
        {rule.map((p, i) => (
          <div key={p.label} className="absolute" style={{ left: i * BLOCK_STEP, top: 0, width: BLOCK_W, height: BLOCK_H }}>
            <Swap k={`${step === 1 ? 1 : 0}-${i}`} className="h-full">
              <div style={{ height: BLOCK_H }}>
                <Block p={p} />
              </div>
            </Swap>
          </div>
        ))}
        {[0, 1].map((i) => (
          <Arrow key={i} from={[i * BLOCK_STEP + BLOCK_W + 6, BLOCK_H / 2]} to={[(i + 1) * BLOCK_STEP - 8, BLOCK_H / 2]} tone={T.backend} width={3} flow={step <= 1} />
        ))}
      </motion.div>

      <div className="absolute" style={{ left: 0, top: 240, width: 1440 }}>
        <Swap k={step >= 2 ? step : 'none'}>
          {step === 2 && (
            <div className="flex items-start gap-8">
              <Code code={CRON} lang="ts" size="sm" title="automations/schedules.service.ts" hl={[1, 5]} tone={T.backend} style={{ width: 1100 }} />
              <div className="flex flex-1 flex-col gap-3 pt-6">
                <TimerReset size={36} className="text-logic" />
                <span className="text-[22px] leading-snug">
                  Тот же <M>SendDeviceCommand</M>, что у кнопки в приложении
                </span>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-8">
              <Where icon={Server} tone={T.backend} title="На бэкенде" plus="push, погода, сложные условия" minus="без интернета не сработает" />
              <Where icon={Router} tone={T.net} title="В хабе, дома" plus="работает без интернета, мгновенно" minus="знает только свои устройства" />
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 3 ? T.net : T.backend}
        captions={[
          'Правило: КОГДА пришло событие → ЕСЛИ выполнено условие → ТО действие',
          'Любое устройство может быть и событием, и действием',
          'Расписание — тоже правило: раз в минуту ищем, что пора выполнить',
          'Выключатель → лампа лучше работает в хабе: дома, даже без интернета',
        ]}
      />
    </SlideLayout>
  );
}
