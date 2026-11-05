'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ClipboardList, Eye, GitBranch, GitMerge, GitPullRequest } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Chip } from '@/components/ui/chip';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE, TASK } from '../it-company/data';
import { ChatLine, ChatWindow } from '../it-company/parts';

/**
 * Первый пул-реквест стажёра. Шаг 0 — пять стадий, шаги 1–5 — по стадии.
 * Переписка копится: на любом шаге видно всё, что было сказано до него.
 */

interface Stage {
  title: string;
  icon: LucideIcon;
  tone: Tone;
  caption: string;
}

const STAGES: Stage[] = [
  { title: 'Задача', icon: ClipboardList, tone: 'ctrl', caption: 'Ментор даёт маленькую задачу с понятным результатом' },
  { title: 'Ветка и код', icon: GitBranch, tone: 'logic', caption: 'Код пишем в своей ветке: основную не трогаем' },
  { title: 'Пул-реквест', icon: GitPullRequest, tone: 'prisma', caption: 'ПР — просьба «посмотрите мой код и влейте его»' },
  { title: 'Ревью', icon: Eye, tone: 'warning', caption: 'Ревью: коллега читает код и оставляет комментарии' },
  { title: 'Мерж', icon: GitMerge, tone: 'success', caption: 'Исправили — код влит в основную ветку. Это ваш первый вклад' },
];

const BRANCH = 'promo-12-error-text';

/** Состояние ПР на каждом шаге: подпись и цвет. */
const PR_STATE: Record<number, { label: string; tone: Tone }> = {
  3: { label: 'открыт', tone: 'prisma' },
  4: { label: 'нужны правки', tone: 'warning' },
  5: { label: 'влит', tone: 'success' },
};

const W = 264;
const G = 30;
const BOX_H = 96;
const CHAT_TOP = 120;
const CHAT_H = 436;

export function FirstPrSlide({ step }: SlideProps) {
  const cur = STAGES[step - 1];
  const pr = PR_STATE[step];
  return (
    <SlideLayout section="internship" title="Первый пул-реквест">
      {STAGES.map((s, i) => {
        const t = TONE[s.tone];
        const active = step === i + 1;
        return (
          <div
            key={s.title}
            className={cn(
              'card absolute flex flex-col items-center justify-center gap-2 border-t-[6px] transition-[box-shadow,opacity] duration-300',
              t.border,
              active && t.ring,
              step > 0 && !active && 'opacity-50',
            )}
            style={{ left: i * (W + G), top: 0, width: W, height: BOX_H }}
          >
            <s.icon size={34} className={t.text} />
            <div className="text-[26px] font-bold leading-tight">{s.title}</div>
          </div>
        );
      })}
      {STAGES.slice(1).map((s, i) => (
        <ArrowRight key={s.title} size={26} className="absolute text-muted" style={{ left: (i + 1) * (W + G) - G / 2 - 13, top: BOX_H / 2 - 13 }} />
      ))}

      <ChatWindow channel="team-cart" className="absolute" style={{ left: 0, top: CHAT_TOP, width: 900, height: CHAT_H }}>
        <Reveal show={step >= 1} from="left">
          <ChatLine who={PEOPLE.dev.name} role="dev" time="11:02">
            Возьми <b>{TASK.key}</b>: поправь текст ошибки «Промокод не найден»
          </ChatLine>
        </Reveal>
        <Reveal show={step >= 3} from="left">
          <ChatLine who={PEOPLE.you.name} role="intern" time="14:20">
            Готово, открыл ПР. Посмотрите?
          </ChatLine>
        </Reveal>
        <Reveal show={step >= 4} from="left">
          <ChatLine who={PEOPLE.dev.name} role="dev" time="15:05">
            Текст ок. Вынеси строку в константу и проверь пустой код
          </ChatLine>
        </Reveal>
        <Reveal show={step >= 5} from="left">
          <ChatLine who={PEOPLE.you.name} role="intern" time="15:40">
            Поправил, спасибо за подсказку
          </ChatLine>
        </Reveal>
        <Reveal show={step >= 5} from="left" delay={0.2}>
          <ChatLine who={PEOPLE.dev.name} role="dev" time="15:46">
            Теперь хорошо, вливаю в основную ветку
          </ChatLine>
        </Reveal>
      </ChatWindow>

      <div className="absolute flex flex-col gap-6" style={{ left: 940, top: CHAT_TOP, width: 500 }}>
        <div className="card flex flex-col gap-4 p-6">
          <div className="text-[17px] font-semibold uppercase tracking-wider text-muted">ваша ветка</div>
          <Reveal show={step >= 2} from="scale" className="self-start">
            <Chip tone="logic" icon={GitBranch}>
              {BRANCH}
            </Chip>
          </Reveal>
        </div>
        <div className="card flex flex-col gap-4 p-6">
          <div className="text-[17px] font-semibold uppercase tracking-wider text-muted">пул-реквест</div>
          <Swap k={pr?.label ?? 'none'}>
            {pr ? (
              <Chip tone={pr.tone} solid icon={GitPullRequest}>
                {pr.label}
              </Chip>
            ) : (
              <span className="text-[24px] text-muted">{step < 3 ? 'ещё не открыт' : ''}</span>
            )}
          </Swap>
        </div>
      </div>

      <StepCaption step={step} tone={cur?.tone ?? 'accent'} captions={['От задачи до мержа: шаги, которые пройдёт каждый ваш ПР', ...STAGES.map((s) => s.caption)]} />
    </SlideLayout>
  );
}
