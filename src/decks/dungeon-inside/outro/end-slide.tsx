'use client';

import type { LucideIcon } from 'lucide-react';
import { FileStack, MessageCircleQuestion, Radio, Route, Triangle } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

const IDEAS: { tone: Tone; icon: LucideIcon; title: string; text: string; flow: string[] }[] = [
  { tone: 'git', icon: FileStack, title: 'Миграции', text: 'История схемы в гите. Деньги защищает база: CHECK и UNIQUE.', flow: ['up.sql', 'down.sql', 'pgmigrations'] },
  { tone: 'prisma', icon: Triangle, title: 'Prisma', text: 'Списать — одним UPDATE. Всё, что связано, — в одной транзакции.', flow: ['updateMany', '$transaction'] },
  { tone: 'ctrl', icon: Route, title: 'Запрос', text: 'Клиент говорит, что сделать. Цену и правила знает сервер.', flow: ['Guard', 'Command', 'Handler', 'Event'] },
  { tone: 'logic', icon: Radio, title: 'Реальное время', text: 'Клиент шлёт ввод, бой считает сервер, в базу — итоги.', flow: ['input', 'Sim 20 Гц', 'snap'] },
];

export function DungeonEndSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Что унести">
      <div className="grid grid-cols-4 gap-6">
        {IDEAS.map((idea, i) => {
          const t = TONE[idea.tone];
          return (
            <Reveal key={idea.title} show={step >= i} from="up">
              <div className={cn('card flex h-full flex-col gap-4 border-t-[6px] p-6', t.border)}>
                <div className="flex items-center gap-3">
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', t.soft, t.text)}>
                    <idea.icon size={26} />
                  </span>
                  <span className="text-[28px] font-bold leading-tight">{idea.title}</span>
                </div>
                <p className="text-[24px] leading-snug">{idea.text}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 font-mono text-[17px] font-semibold">
                  {idea.flow.map((f, j) => (
                    <span key={f} className="flex items-center gap-2">
                      {j > 0 && <span className="text-muted">→</span>}
                      <span className={cn('rounded-lg px-2 py-1', t.soft, t.text)}>{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal show={step >= 4} from="scale" className="mt-14 flex items-center justify-center gap-5">
        <MessageCircleQuestion size={56} className="text-accent" />
        <span className="text-[56px] font-extrabold tracking-tight">Вопросы?</span>
      </Reveal>
    </SlideLayout>
  );
}
