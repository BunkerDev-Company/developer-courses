'use client';

import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { SECTIONS } from '@/lib/sections';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SectionKey, SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';
import { TERM_GROUPS, TERMS, type TermKey } from './data';
import { Avatar, TeamChat } from './parts';

/**
 * Шаги:
 * 0 — стажёра добавили в чат команды, сообщения сыплются
 * 1 — слова-жаргон подсвечены: «а что это значит?»
 * 2 — план занятия: к концу разберём каждое слово
 */

/** Слова из чата — в той форме, как их услышит новичок. */
const UNKNOWN: { text: string; term: TermKey }[] = [
  { text: 'дейли', term: 'daily' },
  { text: 'планнинг', term: 'planning' },
  { text: 'таски', term: 'task' },
  { text: 'тикет', term: 'task' },
  { text: 'ПР', term: 'pr' },
  { text: 'блокер', term: 'blocker' },
  { text: 'пингуй', term: 'ping' },
  { text: 'баг', term: 'bug' },
  { text: 'онбординг', term: 'onboarding' },
  { text: '1:1', term: 'oneOnOne' },
];

const PLAN: { section: SectionKey; text: string }[] = [
  { section: 'company', text: 'Кто главный в компании' },
  { section: 'team', text: 'Кто в команде и что делает' },
  { section: 'meetings', text: 'Как проходят встречи' },
  { section: 'culture', text: 'Как принято общаться' },
];

const RIGHT = { left: 880, width: 560 };

export function FirstDaySlide({ step }: SlideProps) {
  return (
    <SlideLayout section="intro" title="Первый день: чат команды">
      <TeamChat mark={step >= 1 ? 'all' : 'none'} className="absolute" style={{ left: 0, top: 0, width: 820, height: 520 }} />

      {/* Вы */}
      <div className="absolute flex items-center gap-5" style={{ left: RIGHT.left, top: 0, width: RIGHT.width }}>
        <Avatar name="Вы" role="intern" size={84} />
        <div>
          <div className="text-[34px] font-bold leading-tight">Вы</div>
          <div className="text-[22px] text-text-2">стажёр, первый день</div>
        </div>
      </div>

      {/* Мысли новичка */}
      <div className="absolute" style={{ left: RIGHT.left, top: 120, width: RIGHT.width }}>
        <div className="relative rounded-3xl border-2 border-border bg-surface p-6 shadow-card" style={{ minHeight: 400 }}>
          <span className="absolute -top-[13px] left-[30px] h-6 w-6 rotate-45 border-l-2 border-t-2 border-border bg-surface" />
          <Swap k={step}>
            {step === 0 && <div className="text-[30px] font-semibold leading-snug">Ура, меня добавили в чат команды!</div>}
            {step === 1 && (
              <>
                <div className="text-[30px] font-semibold leading-snug">Э-э… а что всё это значит?</div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {UNKNOWN.map((w) => (
                    <Pill key={w.text} tone={TERM_GROUPS[TERMS[w.term].group].tone}>
                      {w.text}?
                    </Pill>
                  ))}
                </div>
              </>
            )}
            {step >= 2 && (
              <>
                <div className="text-[30px] font-semibold leading-snug">Сегодня разберём:</div>
                <div className="mt-5 flex flex-col gap-3.5">
                  {PLAN.map((p, i) => {
                    const t = TONE[SECTIONS[p.section].tone];
                    return (
                      <div key={p.text} className="flex items-center gap-4">
                        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px] font-bold text-white', t.bg)}>{i + 1}</span>
                        <span className="text-[25px] font-semibold">{p.text}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Swap>
        </div>
      </div>

      <StepCaption
        step={step}
        tone="accent"
        captions={['Первый день: вас добавили в рабочий чат', 'Слова вроде русские… но что они значат?', 'К концу занятия этот чат станет понятен']}
      />
    </SlideLayout>
  );
}
