'use client';

import { FileStack, Route, Triangle } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

const TOPICS: { tone: Tone; icon: typeof Route; title: string; text: string }[] = [
  { tone: 'git', icon: FileStack, title: 'Миграции', text: 'как меняется структура базы' },
  { tone: 'prisma', icon: Triangle, title: 'Prisma', text: 'как код узнаёт про таблицы' },
  { tone: 'ctrl', icon: Route, title: 'Путь запроса', text: 'что происходит между кликом и ответом' },
];

export function TitleSlide(_: SlideProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-24 pb-10">
      <Reveal from="down">
        <div className="eyebrow text-center text-accent">NestJS · Prisma · PostgreSQL</div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="mt-5 text-center text-[88px] font-extrabold leading-[1.05] tracking-tight">
          Бэкенд изнутри
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-5 text-center text-[32px] text-text-2">на примере etalon-backend</p>
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
