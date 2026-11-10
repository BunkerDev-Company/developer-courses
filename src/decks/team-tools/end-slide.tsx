'use client';

import type { LucideIcon } from 'lucide-react';
import { CalendarDays, ClipboardCheck, GitPullRequest, Repeat, ShieldCheck, Ticket, Waves } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/** Шаг 0 — шесть итогов, шаг 1 — самостоятельная работа: интерактив на главной. */

const RECAP: { icon: LucideIcon; tone: Tone; title: string; text: string }[] = [
  { icon: Repeat, tone: 'accent', title: 'Agile', text: 'показывать рано и часто, менять план по фактам' },
  { icon: CalendarDays, tone: 'ctrl', title: 'Scrum', text: 'спринты, покер, бёрндаун, демо и ретро' },
  { icon: Waves, tone: 'prisma', title: 'Kanban', text: 'поток задач и лимит WIP' },
  { icon: Ticket, tone: 'guard', title: 'Задача', text: 'история, критерии приёмки, Definition of Done' },
  { icon: GitPullRequest, tone: 'git', title: 'Git', text: 'ветка на задачу, pull request, ревью' },
  { icon: ShieldCheck, tone: 'success', title: 'CI/CD', text: 'робот проверяет каждый PR и выкатывает main' },
];

const W = 464;
const H = 160;
const GAP = 24;

export function EndSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Что запомнить">
      {RECAP.map((r, i) => {
        const t = TONE[r.tone];
        return (
          <Reveal
            key={r.title}
            from="up"
            delay={i * 0.08}
            className="absolute"
            style={{ left: (i % 3) * (W + GAP), top: Math.floor(i / 3) * (H + GAP), width: W }}
          >
            <div className={cn('card flex items-center gap-5 border-l-[8px] px-6', t.border)} style={{ height: H }}>
              <span className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                <r.icon size={34} />
              </span>
              <div>
                <div className="text-[30px] font-bold leading-tight">{r.title}</div>
                <div className="mt-1 text-[21px] leading-snug text-text-2">{r.text}</div>
              </div>
            </div>
          </Reveal>
        );
      })}

      <Reveal show={step >= 1} from="up" className="absolute" style={{ left: 0, top: 2 * (H + GAP) + 16, width: 1440 }}>
        <div className="flex items-center gap-6 rounded-2xl border-2 border-success/40 bg-success/10 px-8 py-6">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-success text-white">
            <ClipboardCheck size={34} />
          </span>
          <div>
            <div className="text-[30px] font-bold leading-tight">Самостоятельно: интерактив на главной</div>
            <div className="mt-1 text-[22px] text-text-2">блок «Инструменты командной разработки» — в конце код для преподавателя</div>
          </div>
        </div>
      </Reveal>

      <StepCaption step={step} tone="success" captions={[null, 'Пройдите интерактив и пришлите код подтверждения']} />
    </SlideLayout>
  );
}
