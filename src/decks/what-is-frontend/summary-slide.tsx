'use client';

import { ArrowRight, Blocks, Eye, MonitorSmartphone, ServerCog } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { LAYER_TONE } from './data';

/**
 * Шаги: по одной главной мысли на шаг; на последнем — «дальше: что такое бэкенд».
 */

const POINTS: { icon: typeof Eye; tone: Tone; title: string; text: string; chips: [string, Tone][] }[] = [
  {
    icon: Eye,
    tone: 'accent',
    title: 'Всё, что видит пользователь',
    text: 'HTML — скелет, CSS — внешний вид, JS — поведение',
    chips: [
      ['HTML', LAYER_TONE.html],
      ['CSS', LAYER_TONE.css],
      ['JS', LAYER_TONE.js],
    ],
  },
  {
    icon: MonitorSmartphone,
    tone: 'db',
    title: 'Работает в браузере',
    text: 'сервер отдаёт файлы, а выполняются они на устройстве пользователя',
    chips: [
      ['index.html', LAYER_TONE.html],
      ['app.js', LAYER_TONE.js],
    ],
  },
  {
    icon: Blocks,
    tone: 'success',
    title: 'Компоненты + данные',
    text: 'React рисует экран из состояния, данные просим у бэкенда',
    chips: [
      ['useState', 'accent'],
      ['useQuery', 'success'],
    ],
  },
];

export function SummarySlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Что запомнить">
      <div className="absolute inset-x-0 top-0 grid grid-cols-3 gap-8">
        {POINTS.map((p, i) => {
          const t = TONE[p.tone];
          return (
            <Reveal key={p.title} show={step >= i} from="up">
              <div
                className={cn(
                  'card flex h-[390px] flex-col gap-5 border-t-[6px] p-8 transition-shadow duration-300',
                  t.border,
                  step === i && t.ring,
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', t.soft, t.text)}>
                    <p.icon size={36} />
                  </div>
                  <span className="text-[22px] font-bold text-muted">0{i + 1}</span>
                </div>
                <div className="text-[34px] font-bold leading-tight">{p.title}</div>
                <div className="text-[24px] leading-snug text-text-2">{p.text}</div>
                <div className="mt-auto flex flex-wrap gap-2">
                  {p.chips.map(([c, tone]) => (
                    <Chip key={c} tone={tone} size="sm" className="text-[17px]">
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal show={step >= 2} from="up" delay={0.5} className="absolute inset-x-0 flex justify-center" style={{ top: 450 }}>
        <div className={cn('flex items-center gap-5 rounded-2xl border-2 bg-surface px-8 py-4 shadow-card', TONE.logic.border)}>
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', TONE.logic.soft, TONE.logic.text)}>
            <ServerCog size={32} />
          </div>
          <span className="text-[30px] font-semibold">
            Дальше: <span className="text-logic">что такое бэкенд</span>
          </span>
          <ArrowRight size={32} className="text-logic" />
        </div>
      </Reveal>
    </SlideLayout>
  );
}
