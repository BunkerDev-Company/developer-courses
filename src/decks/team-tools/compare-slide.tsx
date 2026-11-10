'use client';

import { CalendarDays, Waves } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаги 0–5 — по строке сравнения, шаг 6 — «на практике их смешивают». */

const ROWS: { label: string; scrum: string; kanban: string }[] = [
  { label: 'Ритм', scrum: 'спринты по 1–4 недели', kanban: 'непрерывный поток' },
  { label: 'План', scrum: 'на спринт, на планировании', kanban: 'освободилось место — берём задачу' },
  { label: 'Ограничение', scrum: 'объём спринта', kanban: 'лимит WIP на колонку' },
  { label: 'Роли', scrum: 'Product Owner, Scrum Master, разработчики', kanban: 'обязательных ролей нет' },
  { label: 'Метрика', scrum: 'скорость: поинты за спринт', kanban: 'время цикла задачи' },
  { label: 'Подходит', scrum: 'продукт с новыми фичами', kanban: 'поддержка, баги, поток заявок' },
];

const LABEL_W = 250;
const COL_W = 583;
const GAP = 12;
const HEAD_H = 64;
const ROW_H = 66;
const ROW_GAP = 8;

export function CompareSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="kanban" title="Scrum или Kanban">
      <div
        className={cn('absolute flex items-center gap-3 rounded-2xl border-2 px-6 text-[28px] font-bold', TONE.ctrl.soft, TONE.ctrl.borderSoft, TONE.ctrl.text)}
        style={{ left: LABEL_W + GAP, top: 0, width: COL_W, height: HEAD_H }}
      >
        <CalendarDays size={30} /> Scrum
      </div>
      <div
        className={cn('absolute flex items-center gap-3 rounded-2xl border-2 px-6 text-[28px] font-bold', TONE.prisma.soft, TONE.prisma.borderSoft, TONE.prisma.text)}
        style={{ left: LABEL_W + COL_W + 2 * GAP, top: 0, width: COL_W, height: HEAD_H }}
      >
        <Waves size={30} /> Kanban
      </div>

      {ROWS.map((r, i) => {
        const top = HEAD_H + 12 + i * (ROW_H + ROW_GAP);
        const current = step === i;
        return (
          <Reveal key={r.label} show={step >= i} from="up" className="absolute" style={{ left: 0, top, width: 1440 }}>
            <div className="flex gap-3" style={{ height: ROW_H }}>
              <div className="flex shrink-0 items-center px-2 text-[23px] font-semibold text-text-2" style={{ width: LABEL_W }}>
                {r.label}
              </div>
              <Cell current={current}>{r.scrum}</Cell>
              <Cell current={current}>{r.kanban}</Cell>
            </div>
          </Reveal>
        );
      })}

      <StepCaption
        step={step}
        tone={step >= ROWS.length ? 'accent' : 'prisma'}
        captions={[
          'Scrum живёт спринтами, Kanban — потоком',
          'В Scrum план на спринт, в Kanban — по мере освобождения',
          'Scrum ограничивает спринт, Kanban — каждую колонку',
          'В Kanban нет обязательных ролей — команда как есть',
          'Scrum считает скорость, Kanban — время цикла',
          'Новый продукт — чаще Scrum, поддержка — чаще Kanban',
          'На практике смешивают: спринты + доска с лимитами',
        ]}
      />
    </SlideLayout>
  );
}

function Cell({ current, children }: { current: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'card flex items-center px-6 text-[23px] leading-tight transition-[border-color,box-shadow] duration-300',
        current && cn(TONE.accent.border, TONE.accent.ring),
      )}
      style={{ width: COL_W }}
    >
      {children}
    </div>
  );
}
