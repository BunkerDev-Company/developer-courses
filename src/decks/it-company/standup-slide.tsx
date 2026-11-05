'use client';

import type { LucideIcon } from 'lucide-react';
import { Ban, CircleAlert, CircleCheck, History, Mic, MicOff, MessageSquareQuote, Sunrise, Video } from 'lucide-react';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE, ROLES, type RoleKey } from './data';
import { Avatar } from './parts';

/**
 * Дейли команды «Корзина» по видеосвязи.
 * 0 — три вопроса, 1 — отвечает Макс, 2 — вы (с блокером), 3 — тимлид уносит блокер «после дейли»,
 * 4 — как надо и как не надо.
 */

const CALL: { name: string; role: RoleKey }[] = [PEOPLE.lead, PEOPLE.dev, PEOPLE.qa, PEOPLE.you];

/** Кто говорит на шаге (индекс в CALL). */
const SPEAKER: (number | null)[] = [null, 1, 3, 0, null];

interface Answer {
  yesterday: string;
  today: string;
  blocker: { text: string; bad: boolean };
}

const ANSWERS: Record<number, Answer> = {
  1: {
    yesterday: 'доделал проверку промокода на сервере',
    today: 'тесты и pull request',
    blocker: { text: 'ничего', bad: false },
  },
  2: {
    yesterday: 'поднял проект, разобрался с корзиной',
    today: 'поле для промокода на фронтенде',
    blocker: { text: 'не запускается migrate:up', bad: true },
  },
};

const QUESTIONS: { icon: LucideIcon; label: string; text: string; tone: Tone }[] = [
  { icon: History, label: 'вчера', text: 'Что я сделал?', tone: 'prisma' },
  { icon: Sunrise, label: 'сегодня', text: 'Что буду делать?', tone: 'prisma' },
  { icon: CircleAlert, label: 'мешает', text: 'Что мне мешает?', tone: 'danger' },
];

const TILE_W = 290;
const TILE_H = 196;
const CALL_W = TILE_W * 2 + 20;
const RIGHT = { left: 660, width: 780, height: 520 };

export function StandupSlide({ step }: SlideProps) {
  const speaker = SPEAKER[step];

  return (
    <SlideLayout section="meetings" title="Дейли: 15 минут, три вопроса">
      {/* Звонок */}
      <div className="absolute flex flex-col gap-4" style={{ left: 0, top: 0, width: CALL_W }}>
        <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-2.5">
          <Video size={24} className="text-prisma" />
          <span className="text-[21px] font-bold">дейли «Корзина»</span>
          <span className="ml-auto font-mono text-[18px] text-text-2">10:30 · 15 мин</span>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {CALL.map((p, i) => {
            const talking = speaker === i;
            const r = ROLES[p.role];
            return (
              <div
                key={p.name}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-2xl border-[3px] bg-surface-2 transition-[border-color,box-shadow,opacity] duration-300',
                  talking ? cn(TONE.prisma.border, TONE.prisma.ring) : 'border-transparent',
                  speaker !== null && !talking && 'opacity-60',
                )}
                style={{ height: TILE_H }}
              >
                <Avatar name={p.name} role={p.role} size={88} />
                <div className="absolute bottom-3 left-4 flex items-baseline gap-2">
                  <span className="text-[20px] font-bold">{p.name}</span>
                  <span className={cn('text-[16px] font-semibold', TONE[r.tone].text)}>{r.tag}</span>
                </div>
                <span className={cn('absolute bottom-3 right-4', talking ? 'text-success' : 'text-muted')}>
                  {talking ? <Mic size={24} /> : <MicOff size={22} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Справа: вопросы, ответы, правила */}
      <div className="absolute" style={{ left: RIGHT.left, top: 0, width: RIGHT.width, height: RIGHT.height }}>
        <Swap k={step} className="h-full">
          {step === 0 && <Questions />}
          {(step === 1 || step === 2) && <Answers who={CALL[SPEAKER[step]!]} a={ANSWERS[step]} />}
          {step === 3 && <LeadReply />}
          {step >= 4 && <Rules />}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 2 ? 'danger' : 'prisma'}
        captions={[
          'Каждый день, 15 минут, каждый по очереди отвечает на три вопроса',
          'Макс: коротко и по делу — за минуту',
          'Вы: застряли — говорите вслух. Это не стыдно',
          'Разбирать проблему — после дейли, не всей командой',
          'Дейли — не отчёт начальнику, а сверка команды',
        ]}
      />
    </SlideLayout>
  );
}

function Questions() {
  return (
    <div className="flex flex-col gap-4">
      {QUESTIONS.map((q, i) => {
        const t = TONE[q.tone];
        return (
          <div key={q.label} className={cn('card flex items-center gap-5 border-l-[8px] px-6 py-5', t.border)}>
            <span className="text-[30px] font-bold text-muted">{i + 1}</span>
            <q.icon size={36} className={t.text} />
            <span className="text-[32px] font-bold">{q.text}</span>
          </div>
        );
      })}
      <div className="mt-2 rounded-2xl bg-surface-2 px-6 py-4 text-[23px] leading-snug text-text-2">
        Раньше проводили стоя — отсюда «стендап». Стоя долго не проговоришь.
      </div>
    </div>
  );
}

function Answers({ who, a }: { who: { name: string; role: RoleKey }; a: Answer }) {
  const rows: { q: (typeof QUESTIONS)[number]; text: string; tone?: Tone }[] = [
    { q: QUESTIONS[0], text: a.yesterday },
    { q: QUESTIONS[1], text: a.today },
    { q: QUESTIONS[2], text: a.blocker.text, tone: a.blocker.bad ? 'danger' : 'success' },
  ];
  return (
    <div className="card flex h-full flex-col p-7">
      <div className="flex items-center gap-4">
        <Avatar name={who.name} role={who.role} size={60} />
        <span className="text-[34px] font-bold">{who.name}</span>
        <span className={cn('text-[22px] font-semibold', TONE[ROLES[who.role].tone].text)}>{ROLES[who.role].tag}</span>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {rows.map(({ q, text, tone }) => (
          <div key={q.label} className={cn('flex items-center gap-5 rounded-2xl px-5 py-4', tone ? TONE[tone].soft : 'bg-surface-2')}>
            <span className="flex w-[150px] shrink-0 items-center gap-2.5 text-[19px] font-semibold uppercase tracking-wider text-muted">
              <q.icon size={22} />
              {q.label}
            </span>
            <span className={cn('text-[26px] font-semibold leading-snug', tone && TONE[tone].text)}>
              {text}
              {tone === 'danger' && ' — блокер!'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadReply() {
  return (
    <div className="card flex h-full flex-col gap-6 p-7">
      <div className="flex items-center gap-4">
        <Avatar name={PEOPLE.lead.name} role="lead" size={60} />
        <span className="text-[34px] font-bold">{PEOPLE.lead.name}</span>
        <span className="text-[22px] font-semibold text-git">тимлид</span>
      </div>
      <div className="relative rounded-3xl border-2 border-git bg-git/10 px-7 py-6">
        <MessageSquareQuote size={34} className="mb-2 text-git" />
        <div className="text-[30px] font-semibold leading-snug">
          «Макс, созвонитесь после дейли — вдвоём разберётесь за 10 минут. Остальных не держим»
        </div>
      </div>
      <div className="mt-auto flex items-center gap-4 rounded-2xl bg-surface-2 px-6 py-4 text-[24px] leading-snug">
        <CircleCheck size={30} className="shrink-0 text-success" />
        Блокер услышали сразу, а не через три дня
      </div>
    </div>
  );
}

const DO = ['коротко: 1–2 минуты на человека', 'про блокеры — вслух и сразу', 'детали — после встречи'];
const DONT = ['отчитываться перед начальником', 'решать проблему всей командой', 'опаздывать — ждут все'];

function Rules() {
  return (
    <div className="grid h-full grid-cols-2 gap-5">
      <RuleCol tone="success" icon={CircleCheck} title="Так" items={DO} />
      <RuleCol tone="danger" icon={Ban} title="Не так" items={DONT} />
    </div>
  );
}

function RuleCol({ tone, icon: Icon, title, items }: { tone: Tone; icon: LucideIcon; title: string; items: string[] }) {
  const t = TONE[tone];
  return (
    <div className={cn('card flex flex-col gap-5 border-t-[6px] p-6', t.border)}>
      <div className={cn('flex items-center gap-3 text-[32px] font-bold', t.text)}>
        <Icon size={34} /> {title}
      </div>
      {items.map((x) => (
        <div key={x} className="flex items-start gap-3 text-[25px] leading-snug">
          <span className={cn('mt-3 h-2.5 w-2.5 shrink-0 rounded-full', t.bg)} />
          {x}
        </div>
      ))}
    </div>
  );
}
