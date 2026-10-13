'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowLeftRight, ArrowRight, ChefHat, Layers, Server, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаги 0–3: по карточке-выводу на шаг; 4 — «дальше: Бэкенд изнутри». */

interface Takeaway {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  text: string;
}

const TAKEAWAYS: Takeaway[] = [
  { tone: 'logic', icon: ChefHat, title: 'Бэкенд — кухня', text: 'невидимая часть: данные, правила, расчёты' },
  { tone: 'ctrl', icon: ArrowLeftRight, title: 'Говорят по HTTP', text: 'запрос → ответ: статус и данные в JSON' },
  { tone: 'guard', icon: ShieldCheck, title: 'Фронту не верим', text: 'цены, права и остатки проверяет сервер' },
  { tone: 'db', icon: Layers, title: 'Наш стек', text: 'Node.js, NestJS, PostgreSQL, Prisma, Docker' },
];

const CARD_W = 330;
const GAP = 40;

export function SummarySlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Что запомнить">
      {TAKEAWAYS.map((c, i) => {
        const t = TONE[c.tone];
        return (
          <Reveal key={c.title} show={step >= i} from="up" className="absolute" style={{ left: i * (CARD_W + GAP), top: 0, width: CARD_W }}>
            <div
              className={cn(
                'card flex flex-col gap-5 border-t-[6px] p-7 transition-[box-shadow] duration-300',
                t.border,
                i === step && t.ring,
              )}
              style={{ height: 340 }}
            >
              <div className="flex items-center justify-between">
                <div className={cn('flex h-[72px] w-[72px] items-center justify-center rounded-2xl', t.soft, t.text)}>
                  <c.icon size={40} />
                </div>
                <span className="text-[24px] font-bold text-muted">0{i + 1}</span>
              </div>
              <div className="text-[32px] font-bold leading-tight">{c.title}</div>
              <div className="text-[24px] leading-snug text-text-2">{c.text}</div>
            </div>
          </Reveal>
        );
      })}

      {/* Дальше */}
      <Reveal show={step >= 4} from="up" className="absolute" style={{ left: 0, top: 400, width: 1440 }}>
        <div className="flex items-center gap-6 rounded-3xl border-2 border-ctrl bg-ctrl/10 px-8 py-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ctrl text-white">
            <Server size={36} />
          </div>
          <div className="flex-1">
            <div className="text-[20px] font-semibold uppercase tracking-wider text-ctrl">дальше</div>
            <div className="text-[34px] font-bold leading-tight">Бэкенд изнутри</div>
          </div>
          <div className="text-right text-[24px] text-text-2">миграции · Prisma · путь запроса</div>
          <ArrowRight size={40} className="shrink-0 text-ctrl" />
        </div>
      </Reveal>
    </SlideLayout>
  );
}
