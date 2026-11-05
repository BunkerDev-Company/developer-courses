'use client';

import { ArrowRight, GraduationCap } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { TERM_GROUPS, TERMS, type TermGroup, type TermKey } from './data';
import { TeamChat, type TermMark } from './parts';

/**
 * Возврат к чату первого дня. 0 — все слова подсвечены, 1–3 — словарик по группам
 * (встречи, задачи и код, общение), 4 — «дальше: карьера в IT».
 */

const GROUPS: TermGroup[] = ['meetings', 'work', 'talk'];
const termsOf = (g: TermGroup) => (Object.keys(TERMS) as TermKey[]).filter((k) => TERMS[k].group === g);

const CHAT_W = 640;
const CHAT_H = 520;
const RIGHT = { left: 680, width: 760 };
const GROUP_H = 120;

export function DecodeSlide({ step }: SlideProps) {
  const group = GROUPS[step - 1];
  const mark: TermMark = group ? termsOf(group) : 'all';

  return (
    <SlideLayout section="outro" title="Теперь чат понятен">
      <TeamChat mark={mark} className="absolute" style={{ left: 0, top: 0, width: CHAT_W, height: CHAT_H }} />

      {GROUPS.map((g, i) => {
        const def = TERM_GROUPS[g];
        const t = TONE[def.tone];
        return (
          <Reveal key={g} show={step >= i + 1} from="left" className="absolute" style={{ left: RIGHT.left, top: i * (GROUP_H + 12), width: RIGHT.width }}>
            <div
              className={cn('card flex items-center gap-4 border-l-[8px] px-5 transition-shadow duration-300', t.border, group === g && t.ring)}
              style={{ height: GROUP_H }}
            >
              <span className={cn('w-[120px] shrink-0 text-[22px] font-bold leading-tight', t.text)}>{def.title}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {termsOf(g).map((k) => (
                  <div key={k} className="flex items-baseline gap-3">
                    <span className={cn('w-[150px] shrink-0 text-[21px] font-bold', t.text)}>{TERMS[k].word}</span>
                    <span className="text-[20px] leading-snug text-text-2">{TERMS[k].meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        );
      })}

      {/* Дальше */}
      <Reveal show={step >= 4} from="up" className="absolute" style={{ left: 0, top: CHAT_H + 14, width: 1440 }}>
        <div className="flex items-center gap-6 rounded-3xl border-2 border-git bg-git/10 px-8 py-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-git text-white">
            <GraduationCap size={36} />
          </div>
          <div className="flex-1">
            <div className="text-[20px] font-semibold uppercase tracking-wider text-git">дальше</div>
            <div className="text-[34px] font-bold leading-tight">Карьера в IT</div>
          </div>
          <div className="text-right text-[24px] text-text-2">стажировка · грейды · план развития</div>
          <ArrowRight size={40} className="shrink-0 text-git" />
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={group ? TERM_GROUPS[group].tone : 'accent'}
        captions={['Вернёмся к чату первого дня', 'Встречи: дейли, планнинг, один на один', 'Задачи и код: таски, ПР, баги', 'Общение: блокеры, пинги, онбординг', null]}
      />
    </SlideLayout>
  );
}
