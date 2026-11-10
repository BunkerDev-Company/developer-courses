'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check, ListChecks, Ticket, UsersRound } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { TASK } from '../it-company/data';
import { Pill } from '../what-is-backend/parts';

/** 0 критерии приёмки одной задачи → 1 Definition of Done всей команды → 2 оба выполнены: «Готово». */

const CRITERIA = [
  'Верный код — в итоге видна скидка',
  'Истёкший код — «Промокод истёк»',
  'Второй промокод заменяет первый',
  'Скидку считает сервер',
];

const DOD = [
  'Код прошёл ревью',
  'Проверки CI зелёные',
  'Тестировщик проверил по критериям',
  'Выложено на прод',
  'Статус в трекере обновлён',
];

const CARD_W = 700;
const CARD_H = 480;

export function DodSlide({ step }: SlideProps) {
  const done = step >= 2;
  return (
    <SlideLayout section="task" title="Когда задача готова">
      <ListCard
        x={0}
        tone="guard"
        icon={Ticket}
        title="Критерии приёмки"
        sub={
          <>
            свои у каждой задачи · <span className="font-mono text-git">{TASK.key}</span>
          </>
        }
        items={CRITERIA}
        checked={done}
        active={step === 0}
      />

      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: 1440 - CARD_W, top: 0, width: CARD_W }}>
        <ListCard x={0} tone="success" icon={UsersRound} title="Definition of Done" sub="общий чек-лист команды" items={DOD} checked={done} active={step === 1} inline />
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 0 ? 'guard' : 'success'}
        captions={[
          'Критерии приёмки — что должна уметь именно эта задача',
          'Definition of Done — что сделано с любой задачей команды',
          'Выполнены оба списка — только тогда «Готово»',
        ]}
      />
    </SlideLayout>
  );
}

function ListCard({
  x,
  tone,
  icon: Icon,
  title,
  sub,
  items,
  checked,
  active,
  inline,
}: {
  x: number;
  tone: Tone;
  icon: LucideIcon;
  title: string;
  sub: React.ReactNode;
  items: string[];
  checked: boolean;
  active: boolean;
  inline?: boolean;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        'card flex flex-col gap-4 border-t-[6px] px-7 py-6 transition-shadow duration-300',
        !inline && 'absolute',
        t.border,
        active && t.ring,
      )}
      style={{ left: x, top: 0, width: CARD_W, height: CARD_H }}
    >
      <div className="flex items-center gap-4">
        <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
          <Icon size={30} />
        </span>
        <div>
          <div className="text-[32px] font-bold leading-tight">{title}</div>
          <div className="text-[20px] text-text-2">{sub}</div>
        </div>
        {checked && (
          <span className="ml-auto">
            <Pill tone="success" solid>
              <ListChecks size={20} /> выполнено
            </Pill>
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-3">
        {items.map((it, i) => (
          <div key={it} className="flex items-center gap-4 text-[24px] leading-snug">
            <span className={cn('relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2', t.borderSoft)}>
              <motion.span
                className={cn('absolute inset-0 flex items-center justify-center rounded-md text-white', t.bg)}
                initial={false}
                animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.6 }}
                transition={{ duration: 0.3, delay: checked ? i * 0.15 : 0, ease: EASE }}
              >
                <Check size={22} strokeWidth={3} />
              </motion.span>
            </span>
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}
