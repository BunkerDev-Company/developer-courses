'use client';

import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { HISTORY } from '../data';

/**
 * Шаги:
 * 0 — этап 1: девять миграций — магазин эталона превращается в игру
 * 1 — этап 2 «неткод»: ещё шесть — кооператив, каталог из 100 предметов, классы героев
 * 2 — подсвечены миграции, которые разберём дальше: на них видны главные правила
 */

/** Разберём на следующих слайдах. */
const NEXT = new Set([
  '20261001120000_user-nickname',
  '20261001120100_wallet',
  '20261001120200_items-become-loot',
  '20261001120700_run-active-index-fix',
  '20261015100100_coop-run-players',
]);

const ROW_H = 46;
const COL_W = 700;

function Row({ i, name, lesson, focus, dim }: { i: number; name: string; lesson: string; focus: boolean; dim: boolean }) {
  const short = name.slice(15);
  return (
    <motion.div
      initial={false}
      animate={{ opacity: dim ? 0.35 : 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn(
        'relative flex items-center gap-4 rounded-xl px-3 transition-colors duration-300',
        focus && 'bg-git/10',
      )}
      style={{ height: ROW_H }}
    >
      {focus && <span className="absolute inset-y-1 left-0 w-1.5 rounded-full bg-git" />}
      <span className="w-8 shrink-0 text-right font-mono text-[17px] text-muted">{String(i + 1).padStart(2, '0')}</span>
      <span className={cn('font-mono text-[20px]', focus ? 'font-bold text-git' : 'font-semibold')}>{short}</span>
      <span className="ml-auto truncate pl-4 text-[19px] text-text-2">{lesson}</span>
    </motion.div>
  );
}

export function HistorySlide({ step }: SlideProps) {
  const stage1 = HISTORY.filter((m) => m.stage === 1);
  const stage2 = HISTORY.filter((m) => m.stage === 2);
  const pick = step === 2;

  return (
    <SlideLayout section="migrations" title="История игры: 15 миграций">
      <div className="absolute" style={{ left: 0, top: 0, width: COL_W }}>
        <div className="mb-2 flex items-baseline gap-3 px-3">
          <span className="text-[26px] font-bold">Этап 1</span>
          <span className="text-[20px] text-text-2">магазин эталона становится игрой</span>
        </div>
        {stage1.map((m, i) => (
          <Row key={m.name} i={i} name={m.name} lesson={m.lesson} focus={pick && NEXT.has(m.name)} dim={(pick && !NEXT.has(m.name)) || step === 1} />
        ))}
      </div>

      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: 1440 - COL_W, top: 0, width: COL_W }}>
        <div className="mb-2 flex items-baseline gap-3 px-3">
          <span className="text-[26px] font-bold">Этап 2</span>
          <span className="text-[20px] text-text-2">неткод: бой на сервере, отряд</span>
        </div>
        {stage2.map((m, i) => (
          <Row key={m.name} i={stage1.length + i} name={m.name} lesson={m.lesson} focus={pick && NEXT.has(m.name)} dim={pick && !NEXT.has(m.name)} />
        ))}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-git/40 bg-git/5 px-5 py-4 text-[22px] leading-snug">
          <span className="font-mono font-semibold text-git">initial-schema</span> с этапа 1 никто не трогал — схема менялась только новыми файлами
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone="git"
        captions={[
          'Этап 1: девять миграций — из магазина эталона вырастает игра',
          'Этап 2: ещё шесть — отряд, каталог из 100 предметов, классы героев',
          'Пять из них разберём: на них видно все главные правила',
        ]}
      />
    </SlideLayout>
  );
}
