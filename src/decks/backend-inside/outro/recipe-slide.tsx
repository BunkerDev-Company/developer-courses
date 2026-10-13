'use client';

import { ArrowRight, CheckCircle2, Code2, Database, FileCode2, Triangle } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

interface Item {
  what: string;
  why: string;
}

const PHASES: { tone: Tone; icon: typeof Database; title: string; items: Item[] }[] = [
  {
    tone: 'git',
    icon: Database,
    title: 'База',
    items: [
      { what: 'up.sql / down.sql', why: 'ADD COLUMN category' },
      { what: 'npm run migrate:up', why: 'колонка появилась в БД' },
    ],
  },
  {
    tone: 'prisma',
    icon: Triangle,
    title: 'Prisma',
    items: [
      { what: 'npm run prisma:pull', why: 'db pull + generate' },
      { what: 'category String?', why: 'в schema.prisma и в типах' },
    ],
  },
  {
    tone: 'logic',
    icon: FileCode2,
    title: 'Код бэкенда',
    items: [
      { what: 'item.commands.ts', why: 'поле в CreateItemInput' },
      { what: 'items.dto.ts', why: 'поле в DTO (implements)' },
      { what: 'item-commands.handler', why: 'пишем в prisma.item.create' },
      { what: 'item.presenter.ts', why: 'отдаём наружу' },
    ],
  },
  {
    tone: 'success',
    icon: CheckCircle2,
    title: 'Проверка',
    items: [
      { what: 'npm run build', why: 'компилятор найдёт забытое' },
      { what: 'types/index.ts', why: 'тип Item на фронте' },
    ],
  },
];

const CARD_W = 330;
const GAP = 40;

export function RecipeSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title={<>Всё вместе: товару нужна <M>category</M></>}>
      <div className="flex items-stretch" style={{ gap: GAP }}>
        {PHASES.map((p, i) => {
          const t = TONE[p.tone];
          const shown = step >= i;
          const current = step === i;
          return (
            <Reveal key={p.title} show={shown} from="up" className="relative" style={{ width: CARD_W }}>
              <div
                className={cn(
                  'card flex h-full flex-col border-t-[6px] transition-[box-shadow,border-color] duration-300',
                  t.border,
                  current && t.ring,
                )}
              >
                <div className="flex items-center gap-3 px-5 pb-3 pt-5">
                  <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', t.soft, t.text)}>
                    <p.icon size={24} />
                  </span>
                  <span className="text-[15px] font-bold text-muted">0{i + 1}</span>
                  <span className="text-[26px] font-bold">{p.title}</span>
                </div>
                <ol className="flex flex-col gap-3 px-5 pb-5">
                  {p.items.map((it) => (
                    <li key={it.what} className="rounded-xl bg-surface-2 px-4 py-3">
                      <div className={cn('font-mono text-[18px] font-semibold', t.text)}>{it.what}</div>
                      <div className="mt-1 text-[18px] leading-snug text-text-2">{it.why}</div>
                    </li>
                  ))}
                </ol>
              </div>
              {i < PHASES.length - 1 && (
                <ArrowRight
                  size={30}
                  className={cn('absolute top-8 text-border-2 transition-opacity', step > i ? 'opacity-100' : 'opacity-0')}
                  style={{ right: -GAP + 5 }}
                />
              )}
            </Reveal>
          );
        })}
      </div>

      <Reveal show={step >= 3} delay={0.3} className="absolute inset-x-0 flex justify-center" style={{ top: 486 }}>
        <div className="flex items-center gap-4 text-[26px] font-semibold text-text-2">
          <Code2 size={30} className="text-accent" />
          Порядок всегда один: база → типы → код
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={PHASES[Math.min(step, 3)].tone}
        captions={[
          'Сначала база: миграция и migrate:up',
          'Потом Prisma перечитывает базу — в типах появилось поле',
          'Потом код: по пути запроса, от DTO до presenter',
          'npm run build — и поле дошло до фронта',
        ]}
      />
    </SlideLayout>
  );
}
