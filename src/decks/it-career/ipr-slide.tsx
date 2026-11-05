'use client';

import { Flag } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE } from '../it-company/data';
import { Avatar } from '../it-company/parts';

/** ИПР стажёра «Вы». Шаг 0 — цель, шаги 1–4 — по строке плана. */

interface Row {
  skill: string;
  action: string;
  when: string;
  done: string;
  caption: string;
}

const ROWS: Row[] = [
  {
    skill: 'Писать код без подсказок',
    action: 'Брать одну задачу в неделю целиком',
    when: 'месяц 2',
    done: 'ПР проходит ревью без больших правок',
    caption: 'Навык: самостоятельно делать задачу — и как поймём, что получилось',
  },
  {
    skill: 'Понимать бэкенд',
    action: 'Разобрать путь запроса в нашем коде',
    when: 'месяц 3',
    done: 'Объясню коллеге за 5 минут',
    caption: 'Знание: разобраться в том, как устроен проект',
  },
  {
    skill: 'Тесты',
    action: 'Писать тест к каждой своей задаче',
    when: 'месяц 4',
    done: 'В каждом моём ПР есть тест',
    caption: 'Практика: привычка, которую можно проверить',
  },
  {
    skill: 'Общение',
    action: 'Сообщать о блокере в тот же день',
    when: 'с 1-го дня',
    done: 'Тимлид не узнаёт о проблеме последним',
    caption: 'Поведение: тоже можно записать в план',
  },
];

const COLS = '290px 440px 170px 1fr';
const BANNER_H = 84;
const HEAD_TOP = BANNER_H + 10;
const ROWS_TOP = HEAD_TOP + 36;
const ROW_H = 96;
const ROW_GAP = 10;

export function IprSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="growth" title="ИПР: план развития">
      <div className={cn('absolute flex items-center gap-5 rounded-2xl border-2 px-6', TONE.git.soft, TONE.git.border)} style={{ left: 0, top: 0, width: 1440, height: BANNER_H }}>
        <Avatar name={PEOPLE.you.name} role={PEOPLE.you.role} size={52} />
        <Flag size={30} className="text-git" />
        <span className="text-[30px] font-bold">Цель на полгода: стать Junior</span>
        <span className="ml-auto text-[22px] text-text-2">составили вместе с Анной на 1:1</span>
      </div>

      <div
        className="absolute grid gap-x-5 px-6 text-[17px] font-semibold uppercase tracking-wider text-muted"
        style={{ left: 0, top: HEAD_TOP, width: 1440, gridTemplateColumns: COLS }}
      >
        <span>что улучшаем</span>
        <span>что делаю</span>
        <span>срок</span>
        <span>готово, когда</span>
      </div>

      {ROWS.map((r, i) => {
        const active = step === i + 1;
        return (
          <Reveal key={r.skill} show={step >= i + 1} from="up" className="absolute" style={{ left: 0, top: ROWS_TOP + i * (ROW_H + ROW_GAP), width: 1440 }}>
            <div
              className={cn('card grid items-center gap-x-5 px-6 text-[24px] leading-snug transition-shadow duration-300', active && cn(TONE.git.border, TONE.git.ring))}
              style={{ height: ROW_H, gridTemplateColumns: COLS }}
            >
              <span className="font-bold">{r.skill}</span>
              <span>{r.action}</span>
              <span className={cn('font-semibold', TONE.git.text)}>{r.when}</span>
              <span className="text-text-2">{r.done}</span>
            </div>
          </Reveal>
        );
      })}

      <StepCaption
        step={step}
        tone="git"
        captions={['ИПР — это письменный план: цель, шаги, сроки и как проверить', ...ROWS.map((r) => r.caption)]}
      />
    </SlideLayout>
  );
}
