'use client';

import type { LucideIcon } from 'lucide-react';
import { Radio, Server } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { T } from './data';
import { KettleIcon } from './parts';

const TOPICS: { tone: Tone; icon: LucideIcon; title: string; text: string }[] = [
  { tone: T.device, icon: KettleIcon, title: 'Устройство', text: 'что внутри и как оно выходит в сеть' },
  { tone: T.broker, icon: Radio, title: 'Связь', text: 'MQTT: брокер, топики, подписки' },
  { tone: T.backend, icon: Server, title: 'Бэкенд', text: 'команды, состояние, автоматизации' },
];

export function TitleSlide(_: SlideProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-24 pb-10">
      <Reveal from="down">
        <div className="eyebrow text-center text-accent">IoT · MQTT · NestJS</div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="mt-5 text-center text-[88px] font-extrabold leading-[1.05] tracking-tight">Бэкенд в умном доме</h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-5 text-center text-[32px] text-text-2">как чайник разговаривает с сервером</p>
      </Reveal>

      <div className="mt-20 grid w-full grid-cols-3 gap-8">
        {TOPICS.map((t, i) => {
          const tone = TONE[t.tone];
          return (
            <Reveal key={t.title} from="up" delay={0.35 + i * 0.15}>
              <div className={cn('card flex h-full flex-col gap-5 border-t-[6px] p-8', tone.border)}>
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', tone.soft, tone.text)}>
                    <t.icon size={36} />
                  </div>
                  <span className="text-[22px] font-bold text-muted">0{i + 1}</span>
                </div>
                <div className="text-[38px] font-bold">{t.title}</div>
                <div className="text-[24px] leading-snug text-text-2">{t.text}</div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
