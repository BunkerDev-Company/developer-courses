'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Check, GitPullRequest, X } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE } from '../it-company/data';
import { ChatLine, ChatWindow } from '../it-company/parts';

/** Шаг 0 — комментарий к ПР, 1 — слабая реакция, 2 — сильная, 3 — четыре действия. */

interface Reaction {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  quote: string;
  effect: string;
}

const WEAK: Reaction = {
  icon: X,
  tone: 'danger',
  label: 'Так себе',
  quote: 'Но у меня же работает…',
  effect: 'Спор вместо обучения: оба тратят время',
};

const STRONG: Reaction = {
  icon: Check,
  tone: 'success',
  label: 'Так лучше',
  quote: 'Понял, вынесу. А как лучше назвать функцию?',
  effect: 'Вы учитесь на каждом замечании, и это видно',
};

const ACTIONS = ['Выслушать', 'Уточнить', 'Исправить', 'Поблагодарить'];

const CHAT_W = 640;
const CHAT_H = 250;
const RIGHT_X = 680;
const RIGHT_W = 760;
const REACT_H = 190;

function ReactionCard({ r, show, active }: { r: Reaction; show: boolean; active: boolean }) {
  const t = TONE[r.tone];
  return (
    <Reveal show={show} from="right">
      <div className={cn('card flex flex-col justify-center gap-2 border-l-[8px] px-7 transition-shadow duration-300', t.border, active && t.ring)} style={{ height: REACT_H }}>
        <div className={cn('flex items-center gap-2 text-[20px] font-bold uppercase tracking-wider', t.text)}>
          <r.icon size={24} strokeWidth={3} />
          {r.label}
        </div>
        <div className="text-[29px] font-semibold leading-snug">«{r.quote}»</div>
        <div className="text-[22px] leading-snug text-text-2">{r.effect}</div>
      </div>
    </Reveal>
  );
}

export function FeedbackSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="growth" title="Обратная связь: как принимать">
      <ChatWindow
        channel="ПР #41 · текст ошибки"
        icon={GitPullRequest}
        active={step === 0}
        tone="warning"
        className="absolute"
        style={{ left: 0, top: 0, width: CHAT_W, height: CHAT_H }}
      >
        <ChatLine who={PEOPLE.dev.name} role="dev" time="15:05">
          Проверку промокода лучше вынести в отдельную функцию: её можно будет протестировать
        </ChatLine>
      </ChatWindow>

      <div className="absolute flex flex-col gap-5" style={{ left: RIGHT_X, top: 0, width: RIGHT_W }}>
        <ReactionCard r={WEAK} show={step >= 1} active={step === 1} />
        <ReactionCard r={STRONG} show={step >= 2} active={step === 2} />
      </div>

      <Reveal show={step >= 3} from="up" className="absolute" style={{ left: 0, top: 2 * REACT_H + 56 }}>
        <div className="flex items-center gap-4" style={{ width: 1440 }}>
          {ACTIONS.map((a, i) => (
            <div key={a} className="flex flex-1 items-center gap-4">
              <div className={cn('flex flex-1 items-center justify-center gap-3 rounded-2xl border-2 px-4 py-4 text-[28px] font-bold', TONE.success.soft, TONE.success.borderSoft, TONE.success.text)}>
                <span className="text-[22px] opacity-70">{i + 1}</span>
                {a}
              </div>
              {i < ACTIONS.length - 1 && <ArrowRight size={28} className="shrink-0 text-muted" />}
            </div>
          ))}
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 1 ? 'danger' : 'success'}
        captions={[
          'Комментарий в ПР — не критика вас, а разбор кода',
          'Оправдываться — значит остановить собственный рост',
          'Уточните, если непонятно, — это нормально',
          null,
        ]}
      />
    </SlideLayout>
  );
}
