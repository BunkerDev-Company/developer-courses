'use client';

import { ArrowDown, Check, CookingPot, X } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { T, TOPIC } from './data';

/**
 * Шаги:
 * 0 — MqttService: обычный сервис («техника»), подключается при старте
 * 1 — одна подписка с шаблоном + — на состояние всех устройств
 * 2 — пришло сообщение → разобрали топик → команда в шину (тонко, как контроллер)
 * 3 — отправка команды устройству: publishAsync в …/set, QoS 1
 * Пример в стиле etalon-backend (mqtt.js 5), не код из репозитория.
 */

const SERVICE = `@Injectable()
export class MqttService implements OnModuleInit {
  private client!: MqttClient;
  constructor(private readonly commandBus: CommandBus) {}
  onModuleInit() {
    this.client = connect(config.mqtt.url);
    this.client.subscribe(['dev/+/state', 'dev/+/availability'], { qos: 1 });
    this.client.on('message', (topic, payload) => {
      const [, deviceId, kind] = topic.split('/');
      void this.commandBus.execute(
        new DeviceReportedCommand(deviceId, kind, payload.toString()),
      );
    });
  }
}`;

const SEND = `send(deviceId: string, command: object) {
  return this.client.publishAsync(
    \`dev/\${deviceId}/set\`,
    JSON.stringify(command),
    { qos: 1 },
  );
}`;

const HL = [[1, 2, 5, 6], [7], range(8, 12), []];

const MATCH: { topic: string; ok: boolean }[] = [
  { topic: TOPIC.state, ok: true },
  { topic: 'dev/lamp-3/state', ok: true },
  { topic: TOPIC.availability, ok: true },
  { topic: TOPIC.set, ok: false },
];

const RIGHT = { left: 990, width: 450 };

export function GatewaySlide({ step }: SlideProps) {
  return (
    <SlideLayout section="backend" title={<><M>MqttService</M> — шлюз к брокеру</>}>
      <Code
        code={SERVICE}
        lang="ts"
        size="sm"
        title="infrastructure/mqtt/mqtt.service.ts"
        hl={HL[step]}
        tone={T.backend}
        className="absolute"
        style={{ left: 0, top: 0, width: 960 }}
      />

      <div className="absolute" style={{ left: RIGHT.left, top: 0, width: RIGHT.width }}>
        <Swap k={step}>
          {step === 0 && (
            <div className="card flex flex-col gap-4 px-6 py-5">
              <div className="flex items-center gap-3">
                <CookingPot size={30} className="text-muted" />
                <span className="text-[26px] font-bold">Ещё одна «техника»</span>
              </div>
              <span className="text-[23px] leading-snug">Один на всё приложение — как PrismaService</span>
              <span className="text-[23px] leading-snug">
                Подключается при старте: <M>onModuleInit</M>
              </span>
              <span className="font-mono text-[19px] text-text-2">import {'{ connect, type MqttClient }'} from &apos;mqtt&apos;</span>
            </div>
          )}
          {step === 1 && (
            <div className="card px-6 py-5">
              <div className="mb-3 font-mono text-[22px] font-semibold text-prisma">dev/+/state, dev/+/availability</div>
              {MATCH.map((m) => (
                <div key={m.topic} className={cn('flex items-center gap-3 py-1.5 font-mono text-[19px]', !m.ok && 'text-text-2')}>
                  {m.ok ? <Check size={22} className="shrink-0 text-success" /> : <X size={22} strokeWidth={3} className="shrink-0 text-danger" />}
                  {m.topic}
                </div>
              ))}
              <div className="mt-2 text-[20px] text-text-2">свои команды бэкенд не слушает</div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col items-start gap-2">
              <span className={cn('chip', TONE[T.broker].soft, TONE[T.broker].borderSoft, TONE[T.broker].text)}>{TOPIC.state}</span>
              <ArrowDown size={26} className="ml-6 text-muted" />
              <span className="chip border-border bg-surface-2 text-text">[&apos;dev&apos;, &apos;kettle-1&apos;, &apos;state&apos;]</span>
              <ArrowDown size={26} className="ml-6 text-muted" />
              <span className={cn('chip', TONE[T.backend].soft, TONE[T.backend].borderSoft, TONE[T.backend].text)}>DeviceReportedCommand</span>
              <div className="card mt-4 px-5 py-4 text-[22px] leading-snug">Как контроллер: только разобрать и отдать. Логика — в хендлере</div>
            </div>
          )}
          {step === 3 && <Code code={SEND} lang="ts" size="sm" title="…и в обратную сторону" hl={[2, 3, 4, 5]} tone={T.broker} />}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 1 ? T.broker : T.backend}
        captions={[
          'MqttService — обычный сервис: один на приложение, подключается при старте',
          <>
            Одна подписка с <M>+</M> — состояние сразу всех устройств
          </>,
          'Пришло сообщение — разобрали топик и отдали команду в шину',
          <>
            Команда устройству — <M>publishAsync</M> в его топик <M>…/set</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
