'use client';

import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';
import { PEOPLE, ROLES, type RoleKey } from './data';
import { Avatar, Elbow } from './parts';

/**
 * Оргсхема собирается сверху вниз:
 * 0 — CEO, 1 — директора направлений, 2 — тимлиды, продакты, HR, 3 — команды и «вы здесь»,
 * 4 — ваша линия подчинения: вы → тимлид → CTO → CEO, остальное приглушено.
 */

type BoxState = 'hidden' | 'dim' | 'idle' | 'active';

interface OrgBoxProps {
  role: RoleKey;
  title: string;
  sub: string;
  state: BoxState;
  size?: 'md' | 'sm';
  style: React.CSSProperties;
}

function OrgBox({ role, title, sub, state, size = 'md', style }: OrgBoxProps) {
  const r = ROLES[role];
  const t = TONE[r.tone];
  const md = size === 'md';
  return (
    <motion.div
      className={cn(
        'absolute flex items-center rounded-2xl border-2 bg-surface shadow-card transition-[border-color,box-shadow] duration-300',
        md ? 'gap-4 px-5' : 'gap-2.5 px-3',
        state === 'active' ? cn(t.border, t.ring) : 'border-border',
      )}
      style={style}
      initial={false}
      animate={{ opacity: state === 'hidden' ? 0 : state === 'dim' ? 0.35 : 1, y: state === 'hidden' ? 20 : 0, scale: state === 'active' ? 1.04 : 1 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <span className={cn('flex shrink-0 items-center justify-center rounded-xl', t.soft, t.text, md ? 'h-14 w-14' : 'h-9 w-9')}>
        <r.icon size={md ? 30 : 20} />
      </span>
      <div className="min-w-0">
        <div className={cn('font-bold leading-tight', md ? 'text-[24px]' : 'text-[20px]')}>{title}</div>
        <div className={cn('leading-snug text-text-2', md ? 'text-[18px]' : 'text-[16px]')}>{sub}</div>
      </div>
    </motion.div>
  );
}

// Уровни по Y и высоты блоков.
const Y = { ceo: 0, dir: 128, mid: 256, team: 372 } as const;
const H = { md: 92, sm: 76, team: 112 } as const;
// Три ветки по 456 px: два блока по 220 + зазор 16, между ветками 36.
const BRANCH = 456 + 36;
const SM_W = 220;
const midX = (branch: number, i: number) => branch * BRANCH + SM_W / 2 + i * (SM_W + 16);
const dirX = (branch: number) => branch * BRANCH + 228;
const DIR_W = 420;
const CEO_W = 470;

interface Mid {
  role: RoleKey;
  title: string;
  sub: string;
}

const DIRECTORS: Mid[] = [
  { role: 'cto', title: 'Технический директор', sub: 'CTO · техника и инженеры' },
  { role: 'cpo', title: 'Директор по продукту', sub: 'CPO · что и зачем делаем' },
  { role: 'hr', title: 'HR-директор', sub: 'HRD · люди и найм' },
];

const MIDDLE: Mid[][] = [
  [
    { role: 'lead', title: 'Тимлид', sub: '«Корзина»' },
    { role: 'lead', title: 'Тимлид', sub: '«Каталог»' },
  ],
  [
    { role: 'pm', title: 'Продакт', sub: '«Корзина»' },
    { role: 'pm', title: 'Продакт', sub: '«Каталог»' },
  ],
  [
    { role: 'hr', title: 'Рекрутер', sub: 'ищет людей' },
    { role: 'hr', title: 'HR-менеджер', sub: 'сопровождает' },
  ],
];

const TEAMS: { name: string; people: { name: string; role: RoleKey }[] }[] = [
  { name: '«Корзина»', people: [PEOPLE.dev, PEOPLE.front, PEOPLE.you] },
  { name: '«Каталог»', people: [{ name: 'Тимур', role: 'dev' }, { name: 'Соня', role: 'dev' }, { name: 'Рома', role: 'dev' }] },
];

export function OrgSlide({ step }: SlideProps) {
  const chain = step >= 4;
  const level = (from: number, inChain: boolean): BoxState => (step < from ? 'hidden' : chain ? (inChain ? 'active' : 'dim') : 'idle');

  return (
    <SlideLayout section="company" title="Кто главный в компании">
      {/* Линии: CEO → директора → середина → команды */}
      {DIRECTORS.map((_, b) => (
        <Elbow key={b} show={step >= 1} from={[720, Y.ceo + H.md]} to={[dirX(b), Y.dir]} tone={chain && b === 0 ? 'accent' : 'muted'} />
      ))}
      {MIDDLE.map((pair, b) =>
        pair.map((_, i) => (
          <Elbow key={`${b}-${i}`} show={step >= 2} from={[dirX(b), Y.dir + H.md]} to={[midX(b, i), Y.mid]} tone={chain && b === 0 && i === 0 ? 'accent' : 'muted'} />
        )),
      )}
      {TEAMS.map((_, i) => (
        <Elbow key={i} show={step >= 3} from={[midX(0, i), Y.mid + H.sm]} to={[midX(0, i), Y.team]} tone={chain && i === 0 ? 'accent' : 'muted'} />
      ))}

      <OrgBox
        role="ceo"
        title="Генеральный директор"
        sub="CEO · цели, деньги, стратегия"
        state={step === 0 || chain ? 'active' : 'idle'}
        style={{ left: 720 - CEO_W / 2, top: Y.ceo, width: CEO_W, height: H.md }}
      />

      {DIRECTORS.map((d, b) => (
        <OrgBox key={d.title} role={d.role} title={d.title} sub={d.sub} state={level(1, b === 0)} style={{ left: dirX(b) - DIR_W / 2, top: Y.dir, width: DIR_W, height: H.md }} />
      ))}

      {MIDDLE.map((pair, b) =>
        pair.map((m, i) => (
          <OrgBox
            key={`${b}-${i}`}
            role={m.role}
            title={m.title}
            sub={m.sub}
            size="sm"
            state={level(2, b === 0 && i === 0)}
            style={{ left: midX(b, i) - SM_W / 2, top: Y.mid, width: SM_W, height: H.sm }}
          />
        )),
      )}

      {/* Команды разработчиков под тимлидами */}
      {TEAMS.map((team, i) => {
        const state = level(3, i === 0);
        return (
          <motion.div
            key={team.name}
            className={cn(
              'card absolute flex flex-col items-center gap-2 px-3 py-2.5 transition-[border-color,box-shadow] duration-300',
              state === 'active' && cn(TONE.accent.border, TONE.accent.ring),
            )}
            style={{ left: midX(0, i) - SM_W / 2, top: Y.team, width: SM_W, height: H.team }}
            initial={false}
            animate={{ opacity: state === 'hidden' ? 0 : state === 'dim' ? 0.35 : 1, y: state === 'hidden' ? 20 : 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <span className="text-[16px] font-semibold text-text-2">разработчики</span>
            <div className="flex gap-3">
              {team.people.map((p) => (
                <div key={p.name} className="flex w-[56px] flex-col items-center gap-1">
                  <Avatar name={p.name} role={p.role} size={40} />
                  <span className="text-[15px] font-semibold leading-none">{p.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Вы здесь — под аватаром «Вы» в первой команде */}
      <motion.div
        className="absolute flex justify-center"
        style={{ left: midX(0, 0) + 68 - 90, top: Y.team + H.team + 10, width: 180 }}
        initial={false}
        animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }}
        transition={{ duration: 0.4, delay: step === 3 ? 0.5 : 0, ease: EASE }}
      >
        <Pill tone="accent" solid icon={ArrowUp}>
          вы здесь
        </Pill>
      </motion.div>

      <StepCaption
        step={step}
        tone="accent"
        captions={[
          'CEO — генеральный директор: цели, деньги, стратегия',
          'Под ним — директора: техника, продукт, люди',
          'Дальше — руководители команд и HR',
          'Внизу — те, кто делает продукт. И стажёр тоже здесь',
          'Ваша линия: вы → тимлид → CTO. Вопросы — сначала лиду',
        ]}
      />
    </SlideLayout>
  );
}
