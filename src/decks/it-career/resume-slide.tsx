'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Check, FolderGit2, Layers, Mail, User, X } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаг 0 — слабое резюме, шаги 1–4 — по строке заменяем на сильную. */

interface Row {
  label: string;
  icon: LucideIcon;
  weak: string;
  strong: string;
  fix: string;
}

const ROWS: Row[] = [
  {
    label: 'О себе',
    icon: User,
    weak: 'Ответственный, быстро учусь, коммуникабельный',
    strong: 'Студент 3 курса, делаю бэкенд на NestJS',
    fix: 'О себе: факты вместо качеств, которые есть у всех',
  },
  {
    label: 'Проекты',
    icon: FolderGit2,
    weak: 'Делал сайт',
    strong: 'Интернет-магазин: NestJS + PostgreSQL, код на GitHub',
    fix: 'Проекты: что сделали, на чём — и где посмотреть код',
  },
  {
    label: 'Навыки',
    icon: Layers,
    weak: 'Java, C++, Python, PHP, React, Photoshop, Excel…',
    strong: 'TypeScript, NestJS, PostgreSQL, Git',
    fix: 'Навыки: только то, что готовы показать и обсудить',
  },
  {
    label: 'Контакты',
    icon: Mail,
    weak: 'Телефон',
    strong: 'Telegram, почта, ссылка на GitHub',
    fix: 'Контакты: куда быстро ответить и где посмотреть работы',
  },
];

const LABEL_W = 200;
const CARD_W = 580;
const STRONG_X = 860;
const ROW_H = 106;
const ROW_STEP = 118;
const TOP = 52;

export function ResumeSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="hiring" title="Резюме на одну страницу">
      <div className="absolute flex items-center gap-3 text-[24px] font-bold text-danger" style={{ left: LABEL_W + 20, top: 0 }}>
        <X size={28} strokeWidth={3} /> Слабо
      </div>
      <div className="absolute flex items-center gap-3 text-[24px] font-bold text-success" style={{ left: STRONG_X, top: 0 }}>
        <Check size={28} strokeWidth={3} /> Сильно
      </div>

      {ROWS.map((r, i) => {
        const fixed = i < step;
        const active = i === step - 1;
        const top = TOP + i * ROW_STEP;
        return (
          <div key={r.label}>
            <div className="absolute flex items-center gap-3 text-[26px] font-bold" style={{ left: 0, top, height: ROW_H, width: LABEL_W }}>
              <r.icon size={28} className="text-muted" />
              {r.label}
            </div>

            <div
              className={cn(
                'absolute flex items-center rounded-2xl border-2 px-6 text-[25px] leading-snug transition-opacity duration-300',
                TONE.danger.soft,
                TONE.danger.borderSoft,
                fixed && 'opacity-40',
              )}
              style={{ left: LABEL_W + 20, top, width: CARD_W - 20, height: ROW_H }}
            >
              <span className={cn(fixed && 'line-through decoration-2')}>{r.weak}</span>
            </div>

            <ArrowRight size={30} className="absolute text-muted" style={{ left: LABEL_W + CARD_W + 4, top: top + ROW_H / 2 - 15 }} />

            <div className="absolute rounded-2xl border-2 border-dashed border-border" style={{ left: STRONG_X, top, width: CARD_W, height: ROW_H }} />
            <Reveal show={fixed} from="left" className="absolute" style={{ left: STRONG_X, top, width: CARD_W, height: ROW_H }}>
              <div
                className={cn(
                  'flex h-full items-center rounded-2xl border-2 px-6 text-[25px] font-semibold leading-snug transition-shadow duration-300',
                  TONE.success.soft,
                  TONE.success.borderSoft,
                  active && TONE.success.ring,
                )}
              >
                {r.strong}
              </div>
            </Reveal>
          </div>
        );
      })}

      <StepCaption
        step={step}
        tone={step === 0 ? 'warning' : 'success'}
        captions={['Резюме читают быстро. Каждая строка должна работать', ...ROWS.map((r) => r.fix)]}
      />
    </SlideLayout>
  );
}
