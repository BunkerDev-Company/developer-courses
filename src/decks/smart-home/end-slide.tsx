'use client';

import type { LucideIcon } from 'lucide-react';
import { MessageCircleQuestion, Radio, Server } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { T } from './data';
import { KettleIcon } from './parts';

const IDEAS: { tone: Tone; icon: LucideIcon; title: string; text: string; flow: string[] }[] = [
  {
    tone: T.device,
    icon: KettleIcon,
    title: 'Устройство',
    text: 'Решает простое само. К брокеру подключается само и держит соединение.',
    flow: ['датчик', 'прошивка', 'реле'],
  },
  {
    tone: T.broker,
    icon: Radio,
    title: 'MQTT',
    text: 'Все говорят через брокер. Состояние — retained, онлайн — завещанием.',
    flow: ['state', 'set', 'availability'],
  },
  {
    tone: T.backend,
    icon: Server,
    title: 'Бэкенд',
    text: 'Тот же NestJS: проверяет дом, хранит desired и reported, запускает правила.',
    flow: ['Handler', 'MqttService', 'PostgreSQL'],
  },
];

export function EndSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Три вещи, которые надо унести">
      <div className="grid grid-cols-3 gap-8">
        {IDEAS.map((idea, i) => {
          const t = TONE[idea.tone];
          return (
            <Reveal key={idea.title} show={step >= i} from="up">
              <div className={cn('card flex h-full flex-col gap-5 border-t-[6px] p-7', t.border)}>
                <div className="flex items-center gap-4">
                  <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', t.soft, t.text)}>
                    <idea.icon size={30} />
                  </span>
                  <span className="text-[34px] font-bold">{idea.title}</span>
                </div>
                <p className="text-[25px] leading-snug">{idea.text}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[17px] font-semibold">
                  {idea.flow.map((f, j) => (
                    <span key={f} className="flex items-center gap-2">
                      {j > 0 && <span className="text-muted">·</span>}
                      <span className={cn('rounded-lg px-2 py-1', t.soft, t.text)}>{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal show={step >= 3} from="scale" className="mt-14 flex items-center justify-center gap-5">
        <MessageCircleQuestion size={56} className="text-accent" />
        <span className="text-[56px] font-extrabold tracking-tight">Вопросы?</span>
      </Reveal>
    </SlideLayout>
  );
}
