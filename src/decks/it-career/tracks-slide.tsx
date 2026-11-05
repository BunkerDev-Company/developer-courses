'use client';

import type { LucideIcon } from 'lucide-react';
import { Shuffle, Telescope, Users } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Elbow } from '../it-company/parts';

/** Шаг 0 — Senior на развилке, шаги 1–3 — по дороге: эксперт, менеджер, смена роли. */

interface Track {
  title: string;
  sub: string;
  icon: LucideIcon;
  tone: Tone;
  lines: string[];
  caption: string;
}

const TRACKS: Track[] = [
  {
    title: 'Эксперт',
    sub: 'Staff, Principal',
    icon: Telescope,
    tone: 'logic',
    lines: ['остаётся в коде', 'сложные решения и архитектура', 'учит других разработчиков'],
    caption: 'Эксперт: растёт вглубь и остаётся в технике',
  },
  {
    title: 'Менеджер',
    sub: 'тимлид, руководитель',
    icon: Users,
    tone: 'git',
    lines: ['работает с людьми', 'кода становится меньше', 'отвечает за команду и найм'],
    caption: 'Менеджер: растёт через людей, а не через код',
  },
  {
    title: 'Другая роль',
    sub: 'в соседнюю профессию',
    icon: Shuffle,
    tone: 'prisma',
    lines: ['в аналитику, QA или DevOps', 'или в продакты', 'опыт разработки — плюс'],
    caption: 'Смена роли: опыт разработки пригодится в любой соседней',
  },
];

const CARD_W = 456;
const CARD_GAP = 36;
const CARD_TOP = 190;
const CARD_H = 330;
const ROOT_W = 380;
const ROOT_H = 100;
const ROOT_X = (1440 - ROOT_W) / 2;

export function TracksSlide({ step }: SlideProps) {
  const cur = TRACKS[step - 1];
  return (
    <SlideLayout section="grades" title="Расти можно не только вверх">
      <div
        className={cn('card absolute flex items-center justify-center gap-4 border-2', TONE.logic.border, step === 0 && TONE.logic.ring)}
        style={{ left: ROOT_X, top: 0, width: ROOT_W, height: ROOT_H }}
      >
        <div className="text-center">
          <div className="text-[34px] font-bold leading-tight">Senior</div>
          <div className="text-[21px] text-text-2">дальше — развилка</div>
        </div>
      </div>

      {TRACKS.map((tr, i) => {
        const t = TONE[tr.tone];
        const left = i * (CARD_W + CARD_GAP);
        const active = step === i + 1;
        return (
          <div key={tr.title}>
            <Elbow from={[720, ROOT_H]} to={[left + CARD_W / 2, CARD_TOP]} show={step >= i + 1} tone={tr.tone} />
            <Reveal show={step >= i + 1} from="up" delay={0.2} className="absolute" style={{ left, top: CARD_TOP, width: CARD_W }}>
              <div className={cn('card flex flex-col gap-5 border-t-[6px] p-7 transition-shadow duration-300', t.border, active && t.ring)} style={{ height: CARD_H }}>
                <div className="flex items-center gap-4">
                  <span className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                    <tr.icon size={34} />
                  </span>
                  <div>
                    <div className="text-[34px] font-bold leading-tight">{tr.title}</div>
                    <div className={cn('text-[20px] font-semibold', t.text)}>{tr.sub}</div>
                  </div>
                </div>
                <ul className="flex flex-col gap-3">
                  {tr.lines.map((l) => (
                    <li key={l} className="flex items-start gap-3 text-[24px] leading-snug">
                      <span className={cn('mt-3 h-2.5 w-2.5 shrink-0 rounded-full', t.bg)} />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        );
      })}

      <StepCaption step={step} tone={cur?.tone ?? 'logic'} captions={['Senior — не конец пути: дальше три дороги', ...TRACKS.map((t) => t.caption)]} />
    </SlideLayout>
  );
}
