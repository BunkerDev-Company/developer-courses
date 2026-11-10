'use client';

import { motion } from 'framer-motion';
import { ChevronsRight } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';

/** Шаги 0–3 — по ценности манифеста, шаг 4 — «правое тоже ценно». */

const VALUES: { left: string; right: string; caption: string }[] = [
  { left: 'Люди и взаимодействие', right: 'процессов и инструментов', caption: 'Спросить коллегу быстрее, чем ждать регламента' },
  { left: 'Работающий продукт', right: 'исчерпывающей документации', caption: 'Показать, что работает, важнее, чем описать на 100 страницах' },
  { left: 'Сотрудничество с заказчиком', right: 'согласования условий контракта', caption: 'Заказчик — участник работы, а не сторона договора' },
  { left: 'Готовность к изменениям', right: 'следования первоначальному плану', caption: 'Появились новые факты — меняем план' },
];

const ROW_TOP = 66;
const ROW_H = 100;
const ROW_GAP = 14;

export function ManifestoSlide({ step }: SlideProps) {
  const all = step >= VALUES.length;
  return (
    <SlideLayout section="agile" title="Agile-манифест: четыре ценности">
      <div className="absolute left-0 top-0 flex gap-3">
        <Pill tone="accent">2001 год</Pill>
        <Pill tone="accent">17 разработчиков</Pill>
        <Pill tone="accent">одна страница текста</Pill>
      </div>

      {VALUES.map((v, i) => {
        const current = step === i;
        return (
          <Reveal
            key={v.left}
            show={step >= i}
            from="left"
            className="absolute"
            style={{ left: 0, top: ROW_TOP + i * (ROW_H + ROW_GAP), width: 1440 }}
          >
            <div
              className={cn(
                'card flex items-center gap-8 px-8 transition-[border-color,box-shadow] duration-300',
                current && cn(TONE.accent.border, TONE.accent.ring),
              )}
              style={{ height: ROW_H }}
            >
              <span className="w-[580px] shrink-0 text-[34px] font-bold leading-tight text-accent">{v.left}</span>
              <span className="flex w-[150px] shrink-0 items-center gap-2 text-[24px] font-semibold text-text-2">
                <ChevronsRight size={28} className="text-accent" /> важнее
              </span>
              <motion.span
                className="text-[28px] leading-tight text-text-2"
                initial={false}
                animate={{ opacity: all ? 1 : 0.6 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {v.right}
              </motion.span>
            </div>
          </Reveal>
        );
      })}

      <StepCaption
        step={step}
        tone="accent"
        captions={[...VALUES.map((v) => v.caption), 'Правое тоже ценно — но левое ценнее. Scrum и Kanban — способы так работать']}
      />
    </SlideLayout>
  );
}
