'use client';

import { ArrowDown, Database, Home, Send, ShieldAlert, UserRound } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { KETTLE_ID, T } from './data';
import { KettleIcon } from './parts';

/**
 * Шаги:
 * 0 — мой ли это чайник: устройство ищем только среди домов пользователя
 * 1 — разумная ли команда: 40–100°
 * 2 — сначала desired в базу, 3 — потом publish; контроллер отвечает 202
 * Пример в стиле etalon (CQRS, ErrorService; связи — как у prisma db pull: Home, HomeMember).
 */

const CODE = `async execute({ userId, deviceId, target }: SendDeviceCommand) {
  const device = await this.prisma.device.findFirst({
    where: { id: deviceId, Home: { HomeMember: { some: { user_id: userId } } } },
  });
  if (!device) this.errors.throw('DEVICE_NOT_FOUND');
  if (target < 40 || target > 100)
    this.errors.throw('VALIDATION', 'Температура: 40–100°');

  const desired = { power: 'on', target };
  await this.prisma.device.update({ where: { id: deviceId }, data: { desired } });
  await this.mqtt.send(deviceId, desired);
  return { deviceId, desired };
}`;

const HL: { lines: number[]; tone: Tone }[] = [
  { lines: range(2, 5), tone: 'danger' },
  { lines: [6, 7], tone: T.backend },
  { lines: [9, 10], tone: T.db },
  { lines: [11, 12], tone: T.broker },
];

const RIGHT = { left: 1030, width: 410 };

function Chain() {
  const items: { icon: typeof Home; text: string; tone: Tone }[] = [
    { icon: UserRound, text: 'userId из токена', tone: 'guard' },
    { icon: Home, text: 'дома, где он участник', tone: T.db },
    { icon: KettleIcon, text: `${KETTLE_ID} среди них?`, tone: T.device },
  ];
  return (
    <div className="flex flex-col items-start gap-1.5">
      {items.map((it, i) => (
        <div key={it.text} className="flex flex-col items-start">
          {i > 0 && <ArrowDown size={24} className="ml-5 text-muted" />}
          <span className={cn('flex items-center gap-2.5 rounded-xl border-2 px-3 py-1.5 text-[22px] font-semibold', TONE[it.tone].soft, TONE[it.tone].borderSoft, TONE[it.tone].text)}>
            <it.icon size={22} /> {it.text}
          </span>
        </div>
      ))}
      <div className="card mt-4 flex items-start gap-3 border-danger/40 px-5 py-4">
        <ShieldAlert size={26} className="mt-0.5 shrink-0 text-danger" />
        <span className="text-[21px] leading-snug">Чужой чайник выглядит как несуществующий: 404</span>
      </div>
    </div>
  );
}

export function HandlerSlide({ step }: SlideProps) {
  const hl = HL[step] ?? HL[0];
  return (
    <SlideLayout section="backend" title="Хендлер: мой ли это чайник?">
      <Code code={CODE} lang="ts" size="sm" title="application/handlers/send-device-command.handler.ts" hl={hl.lines} tone={hl.tone} className="absolute" style={{ left: 0, top: 0, width: 1000 }} />

      <div className="absolute" style={{ left: RIGHT.left, top: 0, width: RIGHT.width }}>
        <Swap k={step}>
          {step === 0 && <Chain />}
          {step === 1 && (
            <div className="card px-6 py-5 text-[23px] leading-snug">
              Прошивка проверит ещё раз. <b>Никому не доверяем</b>: ни приложению, ни чайнику
            </div>
          )}
          {step === 2 && (
            <div className="card flex items-start gap-4 px-6 py-5">
              <Database size={30} className="mt-1 shrink-0 text-db" />
              <span className="text-[23px] leading-snug">
                Сначала запомнили, <b>что хотим</b> — <M>desired</M>. Чайник может быть оффлайн
              </span>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col items-start gap-4">
              <div className="card flex items-start gap-4 px-6 py-5">
                <Send size={30} className="mt-1 shrink-0 text-prisma" />
                <span className="text-[23px] leading-snug">Отправили и не ждём: кипятить — минута</span>
              </div>
              <Chip tone="ctrl">@HttpCode(202)</Chip>
              <span className="text-[21px] text-text-2">контроллер отвечает «принято, выполняется»</span>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={hl.tone}
        captions={[
          'Чайник ищем только среди домов этого пользователя',
          'Разумная ли команда? Температура — от 40 до 100°',
          <>
            Сначала записали <M>desired</M> — что мы хотим от чайника
          </>,
          'Потом отправили в брокер. Ответ — сразу, не дожидаясь кипения',
        ]}
      />
    </SlideLayout>
  );
}
