'use client';

import { CircleCheck, CircleHelp, Ticket } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE, TASK } from '../it-company/data';
import { Avatar } from '../it-company/parts';
import { Pill } from '../what-is-backend/parts';

/**
 * Карточка задачи в трекере. 0 плохая: «Сделать промокоды» и вопросы разработчика →
 * 1 история пользователя → 2 критерии приёмки → 3 поля: исполнитель, оценка, спринт, статус.
 */

const QUESTIONS = ['Скидка в процентах или в рублях?', 'А если промокод истёк?', 'Где поле — в корзине или при оплате?'];

const CRITERIA = [
  'Верный код — в итоге корзины видна скидка',
  'Истёкший код — сообщение «Промокод истёк»',
  'Второй промокод заменяет первый',
  'Скидку считает сервер, а не браузер',
];

const STORY: { text: string; tone: Tone }[] = [
  { text: 'Как покупатель,', tone: 'ctrl' },
  { text: 'я хочу ввести промокод в корзине,', tone: 'logic' },
  { text: 'чтобы сразу увидеть цену со скидкой', tone: 'success' },
];

const TICKET_W = 880;
const SIDE_X = 910;
const SIDE_W = 530;

export function StorySlide({ step }: SlideProps) {
  const good = step >= 1;
  return (
    <SlideLayout section="task" title="Хорошая задача: история и критерии">
      <div className="absolute" style={{ left: 0, top: 0, width: TICKET_W }}>
        <Swap k={good ? 'good' : 'bad'}>{good ? <GoodTicket step={step} /> : <BadTicket />}</Swap>
      </div>

      <div className="absolute" style={{ left: SIDE_X, top: 0, width: SIDE_W }}>
        <Swap k={step}>
          {step === 0 && (
            <div className="flex flex-col gap-4">
              {QUESTIONS.map((q, i) => (
                <Reveal key={q} delay={0.2 + i * 0.25}>
                  <div className="flex items-start gap-3">
                    <Avatar name={PEOPLE.dev.name} role={PEOPLE.dev.role} size={44} />
                    <div className="flex items-center gap-2 rounded-2xl border-2 border-danger/40 bg-surface px-4 py-3 text-[22px] leading-snug shadow-card">
                      <CircleHelp size={22} className="shrink-0 text-danger" />
                      {q}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          {step === 1 && (
            <Side tone="ctrl" title="История пользователя">
              Кто, что и <b>зачем</b>. «Зачем» — самое важное: зная цель, команда найдёт решение проще.
            </Side>
          )}
          {step === 2 && (
            <Side tone="guard" title="Критерии приёмки">
              Как проверить, что готово. Пишет аналитик, по ним же проверяет тестировщик.
            </Side>
          )}
          {step >= 3 && (
            <Side tone="git" title="Трекеры">
              Jira, YouTrack, Яндекс Трекер, GitHub Projects — поля почти везде одинаковые.
            </Side>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 0 ? 'danger' : step === 1 ? 'ctrl' : step === 2 ? 'guard' : 'git'}
        captions={[
          '«Сделать промокоды» — каждый поймёт по-своему',
          'История: кто, что и зачем',
          'Критерии приёмки — по ним задачу примут',
          'Исполнитель, оценка, статус — всегда актуальны',
        ]}
      />
    </SlideLayout>
  );
}

function TicketHead({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <Ticket size={26} className="text-git" />
      <span className="font-mono text-[21px] font-semibold text-git">{TASK.key}</span>
      <span className="text-[32px] font-bold leading-tight">{title}</span>
    </div>
  );
}

function BadTicket() {
  return (
    <div className="card flex flex-col gap-5 border-danger/50 p-6" style={{ height: 300 }}>
      <TicketHead title="Сделать промокоды" />
      <div className="text-[19px] font-semibold uppercase tracking-wider text-muted">Описание</div>
      <div className="text-[26px] text-muted">—</div>
      <div className="mt-auto flex gap-3">
        <Pill>исполнитель: —</Pill>
        <Pill>оценка: —</Pill>
      </div>
    </div>
  );
}

function GoodTicket({ step }: { step: number }) {
  return (
    <div className="card flex flex-col gap-4 p-6" style={{ height: 556 }}>
      <TicketHead title={TASK.title} />

      <div className={cn('rounded-xl border-2 px-5 py-3 transition-shadow duration-300', TONE.ctrl.borderSoft, step === 1 && TONE.ctrl.ring)}>
        <div className="text-[17px] font-semibold uppercase tracking-wider text-muted">История пользователя</div>
        <div className="mt-1 text-[25px] leading-snug">
          {STORY.map((s) => (
            <span key={s.text} className={cn('font-semibold', TONE[s.tone].text)}>
              {s.text}{' '}
            </span>
          ))}
        </div>
      </div>

      <Reveal show={step >= 2}>
        <div className={cn('rounded-xl border-2 px-5 py-3 transition-shadow duration-300', TONE.guard.borderSoft, step === 2 && TONE.guard.ring)}>
          <div className="text-[17px] font-semibold uppercase tracking-wider text-muted">Критерии приёмки</div>
          <div className="mt-1.5 flex flex-col gap-1.5">
            {CRITERIA.map((c) => (
              <div key={c} className="flex items-center gap-3 text-[22px] leading-snug">
                <CircleCheck size={22} className="shrink-0 text-guard" /> {c}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal show={step >= 3} className="mt-auto">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="logic">
            <Avatar name={PEOPLE.dev.name} role={PEOPLE.dev.role} size={28} /> Макс
          </Pill>
          <Pill tone="ctrl">5 поинтов</Pill>
          <Pill tone="git">Спринт 14</Pill>
          <Pill tone="accent">В работе</Pill>
        </div>
      </Reveal>
    </div>
  );
}

function Side({ tone, title, children }: { tone: Tone; title: string; children: React.ReactNode }) {
  return (
    <div className={cn('card border-l-[8px] px-6 py-6', TONE[tone].border)}>
      <div className={cn('text-[30px] font-bold leading-tight', TONE[tone].text)}>{title}</div>
      <div className="mt-3 text-[24px] leading-snug text-text-2">{children}</div>
    </div>
  );
}
