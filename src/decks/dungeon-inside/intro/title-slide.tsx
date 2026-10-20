'use client';

import { FileStack, Radio, Route, Triangle } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

const TOPICS: { tone: Tone; icon: typeof Route; title: string; text: string }[] = [
  { tone: 'git', icon: FileStack, title: 'Миграции', text: '15 миграций — у каждой свой урок' },
  { tone: 'prisma', icon: Triangle, title: 'Prisma', text: 'деньги, гонки и транзакции' },
  { tone: 'ctrl', icon: Route, title: 'REST-запрос', text: 'покупка в лавке по слоям' },
  { tone: 'logic', icon: Radio, title: 'Реальное время', text: 'бой считает сервер, 20 раз в секунду' },
];

export function DungeonTitleSlide(_: SlideProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-24 pb-10">
      <Reveal from="down">
        <div className="eyebrow text-center text-accent">NestJS · Prisma · PostgreSQL · socket.io</div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="mt-5 text-center text-[88px] font-extrabold leading-[1.05] tracking-tight">Бэкенд изнутри</h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-5 text-center text-[32px] text-text-2">на примере игры «Подземелье» — dungeon-backend</p>
      </Reveal>

      <div className="mt-20 grid w-full grid-cols-4 gap-7">
        {TOPICS.map((t, i) => {
          const tone = TONE[t.tone];
          return (
            <Reveal key={t.title} from="up" delay={0.35 + i * 0.12}>
              <div className={cn('card flex h-full flex-col gap-4 border-t-[6px] p-7', tone.border)}>
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', tone.soft, tone.text)}>
                    <t.icon size={36} />
                  </div>
                  <span className="text-[22px] font-bold text-muted">0{i + 1}</span>
                </div>
                <div className="text-[34px] font-bold leading-tight">{t.title}</div>
                <div className="text-[24px] leading-snug text-text-2">{t.text}</div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
