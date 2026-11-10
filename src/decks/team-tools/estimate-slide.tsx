'use client';

import { Layers, Ticket } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE, TASK, type RoleKey } from '../it-company/data';
import { Avatar } from '../it-company/parts';
import { Pill } from '../what-is-backend/parts';

/**
 * Покер планирования на PROMO-12.
 * 0 все выбрали карту молча → 1 открыли: 2 и 13 → 2 крайние объясняют → 3 повторное голосование: 5.
 */

const SCALE = ['1', '2', '3', '5', '8', '13', '21', '?'];

interface Voter {
  who: { name: string; role: RoleKey };
  first: string;
  second: string;
  say?: string;
}

const VOTERS: Voter[] = [
  { who: PEOPLE.dev, first: '3', second: '5' },
  { who: PEOPLE.front, first: '3', second: '5' },
  { who: PEOPLE.qa, first: '13', second: '8', say: '«Шесть сценариев проверки: истёк, чужой, два кода сразу…»' },
  { who: PEOPLE.analyst, first: '5', second: '5' },
  { who: PEOPLE.you, first: '2', second: '5', say: '«Там же одно поле ввода»' },
];

const COL_W = 264;
const COL_GAP = 30;
const CARD_W = 124;
const CARD_H = 164;
const CARD_TOP = 178;

export function EstimateSlide({ step }: SlideProps) {
  const open = step >= 1;
  const round2 = step >= 3;

  return (
    <SlideLayout section="scrum" title="Оценка: покер планирования">
      {/* Задача */}
      <div className="card absolute flex flex-col justify-center gap-2 px-6" style={{ left: 0, top: 0, width: 540, height: 136 }}>
        <div className="flex items-center gap-2">
          <Ticket size={22} className="text-git" />
          <span className="font-mono text-[19px] font-semibold text-git">{TASK.key}</span>
          <span className="ml-auto">
            <Swap k={round2 ? 'done' : 'wait'}>
              <Pill tone={round2 ? 'success' : 'muted'} solid={round2}>
                {round2 ? '5 поинтов' : 'оценка: ?'}
              </Pill>
            </Swap>
          </span>
        </div>
        <div className="text-[32px] font-bold leading-tight">{TASK.title}</div>
      </div>

      {/* Шкала */}
      <div className="absolute text-[19px] font-semibold text-muted" style={{ left: 620, top: 0 }}>
        карты — числа Фибоначчи: чем больше задача, тем грубее оценка
      </div>
      {SCALE.map((v, i) => {
        const hit = round2 && v === '5';
        return (
          <div
            key={v}
            className={cn(
              'absolute flex items-center justify-center rounded-xl border-2 bg-surface text-[34px] font-bold shadow-card transition-[border-color,box-shadow] duration-300',
              hit ? cn(TONE.success.border, TONE.success.ring, 'text-success') : 'border-border text-text-2',
            )}
            style={{ left: 620 + i * 103, top: 36, width: 92, height: 100 }}
          >
            {v}
          </div>
        );
      })}

      {/* Голосующие */}
      {VOTERS.map((v, i) => {
        const x = i * (COL_W + COL_GAP);
        const value = round2 ? v.second : v.first;
        const extreme = open && !round2 && (v.first === '2' || v.first === '13');
        return (
          <div key={v.who.name}>
            <div className="absolute" style={{ left: x + (COL_W - CARD_W) / 2, top: CARD_TOP, width: CARD_W, height: CARD_H }}>
              <Swap k={open ? `${round2 ? 2 : 1}-${value}` : 'back'} className="h-full">
                {open ? (
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-2xl border-[3px] bg-surface text-[64px] font-extrabold shadow-lift transition-shadow duration-300',
                      extreme ? cn(TONE.warning.border, TONE.warning.ring) : round2 && value === '5' ? TONE.success.border : 'border-border',
                    )}
                    style={{ height: CARD_H }}
                  >
                    {value}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-2xl border-[3px] border-ctrl bg-ctrl text-white shadow-lift" style={{ height: CARD_H }}>
                    <Layers size={52} />
                  </div>
                )}
              </Swap>
            </div>

            <div className="absolute flex items-center justify-center gap-3" style={{ left: x, top: CARD_TOP + CARD_H + 18, width: COL_W }}>
              <Avatar name={v.who.name} role={v.who.role} size={44} />
              <span className="text-[23px] font-bold">{v.who.name}</span>
            </div>

            {v.say && (
              <Reveal show={step === 2} from="up" className="absolute" style={{ left: x - 10, top: CARD_TOP + CARD_H + 84, width: COL_W + 20 }}>
                <div className={cn('rounded-2xl border-2 bg-surface px-4 py-3 text-[20px] leading-snug shadow-card', TONE.warning.border)}>{v.say}</div>
              </Reveal>
            )}
          </div>
        );
      })}

      <StepCaption
        step={step}
        tone={step === 3 ? 'success' : step >= 1 ? 'warning' : 'ctrl'}
        captions={[
          'Каждый молча выбирает карту — чтобы не подстраиваться под других',
          'Открыли одновременно: 2 и 13 — видят задачу по-разному',
          'Крайние объясняют. Так всплывает то, о чём забыли',
          'Голосуем снова: сошлись на 5. Поинты — сложность, а не часы',
        ]}
      />
    </SlideLayout>
  );
}
