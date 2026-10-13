'use client';

import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  FileCode2,
  FilePlus2,
  FileStack,
  GitCommitHorizontal,
  ListChecks,
  Lock,
  Undo2,
  X,
} from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги: по одной карточке-правилу на шаг, на последнем — конвенции эталона.
 */

const CARD_W = 710;
const CARD_H = 156;
const ROW_GAP = 14;

function RuleCard({
  icon: Icon,
  title,
  show,
  active,
  left,
  top,
  children,
}: {
  icon: LucideIcon;
  title: React.ReactNode;
  show: boolean;
  active: boolean;
  left: number;
  top: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal show={show} from="up" className="absolute" style={{ left, top, width: CARD_W }}>
      <div
        className={cn(
          'card flex flex-col justify-center gap-4 px-6 transition-[border-color,box-shadow] duration-300',
          active && 'border-git shadow-[0_0_0_6px_rgb(var(--c-git)/0.18)]',
        )}
        style={{ height: CARD_H }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-git/10 text-git">
            <Icon size={28} strokeWidth={2} />
          </div>
          <div className="text-[28px] font-bold leading-tight">{title}</div>
        </div>
        <div className="flex items-center gap-3">{children}</div>
      </div>
    </Reveal>
  );
}

const No = ({ children }: { children: React.ReactNode }) => (
  <Chip tone="danger" icon={X} className="line-through decoration-2">
    {children}
  </Chip>
);

const Then = () => <ArrowRight size={28} strokeWidth={2.5} className="shrink-0 text-muted" />;

const CONVENTIONS = [
  { code: '"Order"', label: 'таблицы — "PascalCase"' },
  { code: 'date_create_at', label: 'колонки — snake_case' },
  { code: 'id UUID', label: 'PK — DEFAULT gen_random_uuid()' },
  { code: 'NUMERIC(12,2)', label: 'деньги — не float' },
];

export function RulesSlide({ step }: SlideProps) {
  const x2 = 1440 - CARD_W;
  const y2 = CARD_H + ROW_GAP;

  return (
    <SlideLayout section="migrations" title="Правила миграций">
      <RuleCard icon={FileStack} title="Схема меняется только миграцией" show={step >= 0} active={step === 0} left={0} top={0}>
        <No>pgAdmin</No>
        <No>prisma migrate</No>
        <Then />
        <Chip tone="git" icon={Check} solid>
          migrate:up
        </Chip>
      </RuleCard>

      <RuleCard icon={Lock} title="Применённую не правим" show={step >= 1} active={step === 1} left={x2} top={0}>
        <No>правка старой</No>
        <Then />
        <Chip tone="success" icon={FilePlus2}>
          новая …_widen-item-category
        </Chip>
      </RuleCard>

      <RuleCard icon={Undo2} title="У каждой — рабочий down" show={step >= 2} active={step === 2} left={0} top={y2}>
        <Chip tone="git">up.sql</Chip>
        <ArrowLeftRight size={28} strokeWidth={2.5} className="shrink-0 text-muted" />
        <Chip tone="danger">down.sql</Chip>
        <span className="ml-3 text-[22px] text-text-2">проверка:</span>
        <Chip tone="accent">migrate:redo</Chip>
      </RuleCard>

      <RuleCard icon={GitCommitHorizontal} title="Миграция едет в гит вместе с кодом" show={step >= 3} active={step === 3} left={x2} top={y2}>
        <Chip tone="ctrl" icon={FileCode2}>
          item.presenter.ts
        </Chip>
        <span className="text-[26px] font-bold text-muted">+</span>
        <Chip tone="git" icon={FileStack} solid>
          …_add-item-category
        </Chip>
      </RuleCard>

      {/* Конвенции эталона */}
      <Reveal show={step >= 4} from="up" className="absolute" style={{ left: 0, top: 2 * y2, width: 1440 }}>
        <div
          className={cn(
            'card px-6 py-4 transition-[border-color,box-shadow] duration-300',
            step === 4 && 'border-git shadow-[0_0_0_6px_rgb(var(--c-git)/0.18)]',
          )}
        >
          <div className="flex items-center gap-3 text-[24px] font-bold">
            <ListChecks size={26} className="text-git" />
            Конвенции эталона
            <span className="font-normal text-text-2">(CLAUDE.md)</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-4">
            {CONVENTIONS.map((c) => (
              <div key={c.code} className="rounded-xl bg-surface-2 px-4 py-3">
                <div className="font-mono text-[24px] font-semibold text-db">{c.code}</div>
                <div className="mt-1 text-[18px] text-text-2">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'Схема базы меняется только миграцией — никаких ручных правок',
          'Применённую миграцию не правим — пишем новую',
          'У каждой миграции — рабочий down',
          'Миграция едет в гит в одном коммите с кодом, который её использует',
          'И конвенции эталона: как называть и какие типы брать',
        ]}
      />
    </SlideLayout>
  );
}
