'use client';

import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { SPRING } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';
import { PEOPLE, ROLES, TASK, type RoleKey } from './data';
import { Avatar, RoleIcon } from './parts';

/**
 * Канбан-доска команды. Карточка PROMO-12 едет по колонкам:
 * 0 бэклог → 1 к работе → 2 в работе → 3 ревью → 4 тест (баг!) → 5 обратно в работу → 6 готово.
 */

const COLUMNS: { title: string; roles: RoleKey[] }[] = [
  { title: 'Бэклог', roles: ['pm', 'analyst'] },
  { title: 'К работе', roles: ['lead'] },
  { title: 'В работе', roles: ['dev'] },
  { title: 'Ревью', roles: ['lead', 'dev'] },
  { title: 'Тест', roles: ['qa'] },
  { title: 'Готово', roles: ['devops'] },
];

/** Другие задачи на доске — для живости, приглушены. */
const OTHER: [string, string][][] = [
  [['SHOP-31', 'Оплата частями'], ['SHOP-35', 'Тёмная тема']],
  [['SHOP-28', 'Фильтр по цене']],
  [['SHOP-22', 'Ускорить каталог']],
  [['SHOP-19', 'Отзывы о товаре']],
  [['SHOP-17', 'Письмо о заказе']],
  [['SHOP-11', 'Избранное'], ['SHOP-9', 'Поиск товаров']],
];

interface Stage {
  col: number;
  who: { name: string; role: RoleKey };
  status: string;
  tone: Tone;
  caption: string;
}

const STAGES: Stage[] = [
  { col: 0, who: PEOPLE.analyst, status: 'требования готовы', tone: 'prisma', caption: 'Продакт завёл задачу, аналитик описал требования' },
  { col: 1, who: PEOPLE.lead, status: 'оценка: 3 дня', tone: 'git', caption: 'На планировании команда взяла её в спринт и оценила' },
  { col: 2, who: PEOPLE.dev, status: 'пишу код', tone: 'logic', caption: 'Разработчик взял задачу: код и тесты' },
  { col: 3, who: PEOPLE.lead, status: '2 комментария', tone: 'git', caption: 'Pull request: тимлид и коллеги читают код' },
  { col: 4, who: PEOPLE.qa, status: 'баг!', tone: 'danger', caption: 'Тестировщик проверяет — и находит баг' },
  { col: 2, who: PEOPLE.dev, status: 'чиню баг', tone: 'logic', caption: 'Задача вернулась разработчику. Это нормально!' },
  { col: 5, who: { name: 'Сергей', role: 'devops' }, status: 'на проде', tone: 'success', caption: 'Повторный тест пройден, DevOps выкатил. Готово!' },
];

const COL_W = 228;
const COL_GAP = 14.4;
const colX = (i: number) => i * (COL_W + COL_GAP);
const COL_H = 406;
const HEAD_H = 52;
const SLOT_TOP = 64;
const CARD_H = 156;
const OTHER_TOP = SLOT_TOP + CARD_H + 12;
const OTHER_H = 76;

export function TaskSlide({ step }: SlideProps) {
  const s = STAGES[step];
  const ownerTone = ROLES[s.who.role].tone;
  const cardTone: Tone = s.tone === 'danger' || s.tone === 'success' ? s.tone : 'accent';

  return (
    <SlideLayout section="team" title="Путь задачи: от идеи до релиза">
      {COLUMNS.map((c, i) => {
        const here = s.col === i;
        const t = TONE[ownerTone];
        return (
          <div
            key={c.title}
            className={cn(
              'absolute rounded-2xl border-2 bg-surface-2 transition-[border-color,box-shadow] duration-300',
              here ? cn(t.border, t.ring) : 'border-border',
            )}
            style={{ left: colX(i), top: 0, width: COL_W, height: COL_H }}
          >
            <div className="flex items-center gap-2 px-3" style={{ height: HEAD_H }}>
              <span className={cn('text-[22px] font-bold', here ? 'text-text' : 'text-text-2')}>{c.title}</span>
              <span className="ml-auto flex gap-1.5">
                {c.roles.map((r) => (
                  <RoleIcon key={r} role={r} size={32} className="rounded-lg" />
                ))}
              </span>
            </div>
            {OTHER[i].map(([key, title], j) => (
              <div
                key={key}
                className="absolute flex flex-col justify-center gap-1 rounded-xl border-2 border-border bg-surface px-3 opacity-70"
                style={{ left: 6, top: OTHER_TOP + j * (OTHER_H + 10), width: COL_W - 16, height: OTHER_H }}
              >
                <span className="font-mono text-[15px] text-muted">{key}</span>
                <span className="truncate text-[19px] font-semibold text-text-2">{title}</span>
              </div>
            ))}
          </div>
        );
      })}

      {/* Наша задача */}
      <motion.div
        className={cn(
          'absolute left-0 z-10 flex flex-col gap-2 rounded-xl border-[3px] bg-surface p-3 shadow-lift transition-colors duration-300',
          TONE[cardTone].border,
        )}
        style={{ top: SLOT_TOP, width: COL_W - 16, height: CARD_H }}
        initial={false}
        animate={{ x: colX(s.col) + 6 }}
        transition={SPRING}
      >
        <div className="flex items-center gap-1.5">
          <Ticket size={18} className="text-git" />
          <span className="font-mono text-[16px] font-semibold text-git">{TASK.key}</span>
          <Avatar name={s.who.name} role={s.who.role} size={32} className="ml-auto" />
        </div>
        <span className="text-[21px] font-bold leading-tight">{TASK.title}</span>
        <div className="mt-auto">
          <Pill tone={s.tone} solid={s.tone === 'danger' || s.tone === 'success'} className="px-2.5 text-[18px]">
            {s.status}
          </Pill>
        </div>
      </motion.div>

      {/* Возврат с багом */}
      <Arrow
        show={step === 5}
        from={[colX(4) + COL_W / 2, COL_H + 14]}
        to={[colX(2) + COL_W / 2, COL_H + 14]}
        curve={-40}
        tone="danger"
        label="вернули с багом"
        labelOffset={[0, 16]}
      />

      <StepCaption step={step} tone={ownerTone} captions={STAGES.map((x) => x.caption)} />
    </SlideLayout>
  );
}
