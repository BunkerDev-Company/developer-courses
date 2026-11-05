'use client';

import { motion } from 'framer-motion';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE, ROLES, type RoleKey } from './data';
import { Avatar } from './parts';

/**
 * Матрица «отделы × команды».
 * 0 — столбцы: отделы по профессиям, 1 — строки: команды по частям продукта,
 * 2 — команда «Корзина»: восемь человек из пяти отделов.
 */

const DEPTS: { role: RoleKey; title: string }[] = [
  { role: 'pm', title: 'Продукт' },
  { role: 'analyst', title: 'Аналитика' },
  { role: 'design', title: 'Дизайн' },
  { role: 'dev', title: 'Разработка' },
  { role: 'qa', title: 'Тестирование' },
];

type Person = { name: string; role: RoleKey };
const p = (name: string, role: RoleKey): Person => ({ name, role });

/** По строке на команду, в строке — люди по отделам (в порядке DEPTS). */
const TEAMS: { name: string; cells: Person[][] }[] = [
  {
    name: 'Корзина',
    cells: [[PEOPLE.pm], [PEOPLE.analyst], [PEOPLE.design], [PEOPLE.lead, PEOPLE.dev, PEOPLE.front, PEOPLE.you], [PEOPLE.qa]],
  },
  {
    name: 'Каталог',
    cells: [[p('Петя', 'pm')], [p('Аня', 'analyst')], [p('Вика', 'design')], [p('Игорь', 'lead'), p('Тимур', 'dev'), p('Соня', 'dev'), p('Рома', 'dev')], [p('Гоша', 'qa')]],
  },
  {
    name: 'Доставка',
    cells: [[p('Нина', 'pm')], [p('Лёша', 'analyst')], [p('Ксюша', 'design')], [p('Боря', 'lead'), p('Дима', 'dev'), p('Оля', 'dev')], [p('Фёдор', 'qa')]],
  },
];

const LABEL_W = 200;
const COL_W = 232;
const COL_GAP = 15;
const colX = (i: number) => LABEL_W + 20 + i * (COL_W + COL_GAP);
const HEAD_H = 96;
const ROW_TOP = [118, 240, 362];
const ROW_H = 108;

export function DeptsSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="company" title="Отделы и команды">
      {/* Отделы — столбцы */}
      {DEPTS.map((d, i) => {
        const { tone, icon: Icon } = ROLES[d.role];
        const t = TONE[tone];
        return (
          <motion.div
            key={d.title}
            className={cn('absolute rounded-3xl border-2', t.soft, t.borderSoft)}
            style={{ left: colX(i), top: 0, width: COL_W, height: ROW_TOP[2] + ROW_H + 12 }}
            initial={false}
            animate={{ opacity: step === 0 ? 1 : 0.45 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex flex-col items-center gap-2 pt-3" style={{ height: HEAD_H }}>
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-surface', t.text)}>
                <Icon size={26} />
              </span>
              <span className={cn('text-[23px] font-bold', t.text)}>{d.title}</span>
            </div>
          </motion.div>
        );
      })}

      {/* Команды — строки */}
      {TEAMS.map((team, r) => {
        const ours = r === 0;
        const dim = step >= 2 && !ours;
        return (
          <motion.div
            key={team.name}
            className="absolute left-0"
            style={{ top: ROW_TOP[r], width: 1440, height: ROW_H }}
            initial={false}
            animate={{ opacity: dim ? 0.3 : 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Рамка команды */}
            <motion.div
              className={cn(
                'absolute -inset-x-1 -inset-y-1 rounded-3xl border-[3px] transition-[border-color,box-shadow] duration-300',
                step >= 2 && ours ? cn(TONE.git.border, TONE.git.ring) : 'border-border-2',
              )}
              initial={false}
              animate={{ opacity: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            />
            <motion.div
              className="absolute flex h-full flex-col justify-center pl-6"
              style={{ width: LABEL_W }}
              initial={false}
              animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -20 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <span className="text-[17px] font-semibold uppercase tracking-wider text-muted">команда</span>
              <span className={cn('text-[30px] font-bold leading-tight', step >= 2 && ours && 'text-git')}>{team.name}</span>
            </motion.div>

            {team.cells.map((cell, i) => (
              <div key={i} className="absolute flex h-full items-center justify-center gap-1.5" style={{ left: colX(i), width: COL_W }}>
                {cell.map((person) => (
                  <div key={person.name} className="flex w-[52px] flex-col items-center gap-1.5">
                    <Avatar name={person.name} role={person.role} size={44} />
                    <span className="text-[15px] font-semibold leading-none">{person.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        );
      })}

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'Компания делится на отделы — по профессиям',
          'А работают командами — каждая делает свою часть продукта',
          'Команда «Корзина»: восемь человек из пяти отделов',
        ]}
      />
    </SlideLayout>
  );
}
