'use client';

import { motion } from 'framer-motion';
import { Check, Package, Quote, Ticket } from 'lucide-react';
import { Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';
import { ROLES, TASK, type RoleKey } from './data';
import { RoleIcon } from './parts';

/**
 * Шаги 0–6: по роли на шаг — её главный вопрос, что делает и что она сказала бы про промокод.
 * Шаг 7: все роли вместе — команда; роль ≠ человек.
 */

interface TeamRole {
  role: RoleKey;
  question: string;
  does: string[];
  /** Что остаётся после работы. */
  result: string[];
  /** Реплика про задачу «Промокод в корзине». */
  promo: string;
  caption: string;
}

export const TEAM: TeamRole[] = [
  {
    role: 'pm',
    question: 'Что делаем и зачем?',
    does: ['решает, что сейчас важнее', 'говорит с бизнесом и пользователями', 'ведёт бэклог — очередь задач'],
    result: ['бэклог', 'приоритеты'],
    promo: 'Промокоды поднимут продажи — берём в этот спринт',
    caption: 'Продакт решает, ЧТО делаем и в каком порядке',
  },
  {
    role: 'analyst',
    question: 'Как это должно работать — точно?',
    does: ['превращает идею в требования', 'продумывает крайние случаи', 'отвечает на вопросы команды'],
    result: ['требования', 'ТЗ'],
    promo: 'Промокод одноразовый. Истёк — показываем ошибку',
    caption: 'Аналитик описывает, КАК это должно работать',
  },
  {
    role: 'design',
    question: 'Как это выглядит и удобно ли?',
    does: ['рисует экраны и все их состояния', 'думает, как пользователю проще', 'проверяет идеи на людях'],
    result: ['макет в Figma'],
    promo: 'Поле под корзиной, ошибка — красным под полем',
    caption: 'Дизайнер рисует, как это будет выглядеть',
  },
  {
    role: 'dev',
    question: 'Как сделать это в коде?',
    does: ['фронтенд: поле, кнопка, пересчёт суммы', 'бэкенд: проверка промокода на сервере', 'оценивает сроки, пишет тесты'],
    result: ['код', 'pull request'],
    promo: 'Скидку считает сервер — фронтенду не верим',
    caption: 'Разработчики превращают всё это в код',
  },
  {
    role: 'qa',
    question: 'Точно работает? А если…?',
    does: ['проверяет по требованиям', 'ищет, как сломать', 'заводит баги и проверяет исправления'],
    result: ['тест-кейсы', 'баг-репорты'],
    promo: 'А если ввести промокод маленькими буквами? А дважды?',
    caption: 'Тестировщик ищет, где сломается, — до пользователей',
  },
  {
    role: 'devops',
    question: 'Как доставить и не уронить?',
    does: ['серверы, базы, доступы', 'автоматическая выкладка (CI/CD)', 'мониторинг: всё ли живо'],
    result: ['пайплайн', 'прод'],
    promo: 'Выкатили — смотрим на графики ошибок',
    caption: 'DevOps выкладывает код на сервер и следит, чтобы не упало',
  },
  {
    role: 'lead',
    question: 'Как команде сделать хорошо?',
    does: ['принимает технические решения', 'ревьюит код, делит работу', 'растит людей: 1:1, обратная связь'],
    result: ['решения', 'ревью'],
    promo: 'Делим на три задачи: бэкенд, фронтенд, тесты',
    caption: 'Тимлид отвечает за то, как работает команда',
  },
];

// Круг ролей слева, в центре — задача.
const CX = 300;
const CY = 262;
const R = 212;
const NODE = 88;
const pos = (i: number) => {
  const a = ((-90 + (i * 360) / TEAM.length) * Math.PI) / 180;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
};

const PANEL = { left: 640, top: 0, width: 800, height: 530 };

export function TeamSlide({ step }: SlideProps) {
  const all = step >= TEAM.length;
  const cur = all ? null : TEAM[step];

  return (
    <SlideLayout section="team" title="Кто в команде и что делает">
      {/* Спицы от задачи к ролям */}
      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
        {TEAM.map((m, i) => {
          const { x, y } = pos(i);
          const on = all || i === step;
          return (
            <line
              key={m.role}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              strokeWidth={on ? 4 : 3}
              strokeDasharray={on ? undefined : '2 10'}
              strokeLinecap="round"
              className={cn('transition-[stroke] duration-300', on ? TONE[ROLES[m.role].tone].stroke : 'stroke-border-2')}
            />
          );
        })}
      </svg>

      {/* Задача в центре */}
      <div className="card absolute flex flex-col items-center justify-center gap-1.5 text-center" style={{ left: CX - 92, top: CY - 58, width: 184, height: 116 }}>
        <span className="flex items-center gap-1.5 font-mono text-[16px] font-semibold text-git">
          <Ticket size={18} />
          {TASK.key}
        </span>
        <span className="px-2 text-[20px] font-bold leading-tight">{TASK.title}</span>
      </div>

      {/* Роли по кругу */}
      {TEAM.map((m, i) => {
        const { x, y } = pos(i);
        const r = ROLES[m.role];
        const t = TONE[r.tone];
        const on = all || i === step;
        const seen = all || i <= step;
        return (
          <motion.div
            key={m.role}
            className="absolute flex flex-col items-center gap-1.5"
            style={{ left: x - 80, top: y - NODE / 2, width: 160 }}
            initial={false}
            animate={{ opacity: seen ? 1 : 0.35, scale: i === step ? 1.08 : 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <span
              className={cn(
                'flex items-center justify-center rounded-full border-[3px] bg-surface transition-[border-color,box-shadow] duration-300',
                on ? cn(t.border, t.text, i === step && t.ring) : 'border-border text-muted',
              )}
              style={{ width: NODE, height: NODE }}
            >
              <r.icon size={42} />
            </span>
            <span className={cn('rounded-lg bg-bg/80 px-1.5 text-[19px] font-bold leading-tight', on ? 'text-text' : 'text-text-2')}>
              {m.role === 'pm' ? 'Продакт' : r.name}
            </span>
          </motion.div>
        );
      })}

      {/* Карточка текущей роли */}
      <div className="absolute" style={PANEL}>
        <Swap k={step} className="h-full">
          {cur ? <RoleCard m={cur} /> : <AllCard />}
        </Swap>
      </div>

      <StepCaption step={step} tone={cur ? ROLES[cur.role].tone : 'git'} captions={[...TEAM.map((m) => m.caption), 'Команда — 5–10 человек. Один человек может совмещать роли']} />
    </SlideLayout>
  );
}

function RoleCard({ m }: { m: TeamRole }) {
  const r = ROLES[m.role];
  const t = TONE[r.tone];
  return (
    <div className={cn('card flex flex-col p-7', t.border)} style={{ height: PANEL.height }}>
      <div className="flex items-center gap-5">
        <RoleIcon role={m.role} size={72} />
        <div>
          <div className="text-[38px] font-bold leading-tight">{r.name}</div>
          <div className={cn('text-[30px] font-semibold leading-tight', t.text)}>«{m.question}»</div>
        </div>
      </div>

      <ul className="mt-6 flex flex-col gap-2.5">
        {m.does.map((d) => (
          <li key={d} className="flex items-center gap-3 text-[25px] leading-snug">
            <Check size={26} className={cn('shrink-0', t.text)} strokeWidth={2.5} />
            {d}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-3">
        <span className="flex items-center gap-2 text-[21px] text-text-2">
          <Package size={22} className="text-muted" /> результат:
        </span>
        {m.result.map((x) => (
          <Pill key={x} tone={r.tone}>
            {x}
          </Pill>
        ))}
      </div>

      <div className={cn('mt-auto flex items-start gap-4 rounded-2xl px-5 py-4', t.soft)}>
        <Quote size={30} className={cn('mt-0.5 shrink-0', t.text)} />
        <div>
          <div className="font-mono text-[16px] font-semibold text-text-2">{TASK.key} · {TASK.title}</div>
          <div className="mt-1 text-[24px] font-semibold leading-snug">{m.promo}</div>
        </div>
      </div>
    </div>
  );
}

function AllCard() {
  return (
    <div className="card flex flex-col gap-4 border-git p-7" style={{ height: PANEL.height }}>
      <div className="text-[34px] font-bold leading-tight">Вместе — команда</div>
      <div className="flex flex-col gap-2">
        {TEAM.map((m) => {
          const r = ROLES[m.role];
          return (
            <div key={m.role} className="flex items-center gap-4">
              <RoleIcon role={m.role} size={36} />
              <span className="w-[230px] shrink-0 text-[22px] font-bold">{r.name}</span>
              <span className={cn('text-[22px] font-semibold', TONE[r.tone].text)}>«{m.question}»</span>
            </div>
          );
        })}
      </div>
      <div className="mt-auto rounded-2xl bg-surface-2 px-5 py-3.5 text-[22px] leading-snug text-text-2">
        <b className="text-text">Роль ≠ человек.</b> В маленькой команде тимлид пишет код, а продакт сам пишет требования.
      </div>
    </div>
  );
}
