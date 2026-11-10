'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Eye, MessageCircleWarning, RefreshCcw, Repeat, Waves } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Полгода работы двумя способами.
 * 0 водопад: этапы по очереди → 1 первый показ в самом конце: «не то» →
 * 2 итерации по 2 недели → 3 показ после каждой, план поправили рано.
 */

const PHASES: { name: string; from: number; to: number; tone: Tone }[] = [
  { name: 'Требования', from: 0, to: 1, tone: 'prisma' },
  { name: 'Дизайн', from: 1, to: 2, tone: 'db' },
  { name: 'Разработка', from: 2, to: 4.5, tone: 'logic' },
  { name: 'Тест', from: 4.5, to: 5.5, tone: 'success' },
  { name: 'Релиз', from: 5.5, to: 6, tone: 'ctrl' },
];

const LABEL_W = 260;
const TL_X = 290;
const TL_W = 1150;
const MONTH = TL_W / 6;
const mx = (m: number) => TL_X + m * MONTH;

const LANE1 = { top: 40, h: 240 };
const LANE2 = { top: 300, h: 210 };
const PHASE_TOP = LANE1.top + 18;
const PHASE_H = 34;
const PHASE_GAP = 40;

const SPRINTS = 12;
const CELL_GAP = 8;
const CELL_W = (TL_W - (SPRINTS - 1) * CELL_GAP) / SPRINTS;
const CELL_TOP = LANE2.top + 22;
const CELL_H = 110;

export function WaterfallSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="agile" title="Водопад и итерации">
      {/* Шкала месяцев */}
      {Array.from({ length: 6 }, (_, m) => (
        <div
          key={m}
          className="absolute text-center text-[18px] font-semibold text-muted"
          style={{ left: mx(m), top: 0, width: MONTH }}
        >
          {m + 1} мес
        </div>
      ))}
      {Array.from({ length: 5 }, (_, m) => (
        <div
          key={m}
          className="absolute border-l-2 border-dashed border-border"
          style={{ left: mx(m + 1), top: 30, height: LANE2.top + LANE2.h - 30 }}
        />
      ))}

      {/* Водопад */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: step >= 2 ? 0.45 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Lane top={LANE1.top} h={LANE1.h} icon={Waves} tone="logic" title="Водопад" sub="этапы по очереди, по одному разу" />
        {PHASES.map((p, i) => {
          const t = TONE[p.tone];
          return (
            <Reveal
              key={p.name}
              from="right"
              delay={i * 0.12}
              className="absolute"
              style={{ left: mx(p.from), top: PHASE_TOP + i * PHASE_GAP, width: mx(p.to) - mx(p.from) - 4 }}
            >
              <div
                className={cn('flex items-center rounded-lg border-2 px-3 text-[20px] font-bold', t.soft, t.borderSoft, t.text)}
                style={{ height: PHASE_H }}
              >
                {p.name}
              </div>
            </Reveal>
          );
        })}

        <Reveal show={step >= 1} from="scale" className="absolute" style={{ left: 740, top: LANE1.top + 14, width: 420 }}>
          <div className="flex items-center gap-4 rounded-2xl border-2 border-danger bg-surface px-5 py-2.5 shadow-lift">
            <MessageCircleWarning size={34} className="shrink-0 text-danger" />
            <div>
              <div className="text-[17px] font-semibold text-muted">первый показ пользователям</div>
              <div className="text-[23px] font-bold leading-tight">«Это не то, что нам нужно»</div>
            </div>
          </div>
        </Reveal>
      </motion.div>

      {/* Итерации */}
      <Reveal show={step >= 2} from="up" className="absolute inset-0">
        <Lane top={LANE2.top} h={LANE2.h} icon={Repeat} tone="ctrl" title="Итерации" sub="спринты по 2 недели" active={step >= 2} />
        {Array.from({ length: SPRINTS }, (_, i) => {
          const fixed = step >= 3 && i === 1;
          return (
            <div
              key={i}
              className={cn(
                'absolute flex flex-col justify-between rounded-xl border-2 bg-surface p-2 transition-[border-color,box-shadow] duration-300',
                fixed ? cn(TONE.warning.border, TONE.warning.ring) : 'border-border',
              )}
              style={{ left: TL_X + i * (CELL_W + CELL_GAP), top: CELL_TOP, width: CELL_W, height: CELL_H }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[19px] font-bold">С{i + 1}</span>
                {fixed && <RefreshCcw size={18} className="text-warning" />}
              </div>
              <div className="flex flex-col gap-1">
                {PHASES.slice(0, 4).map((p) => (
                  <span key={p.name} className={cn('h-2 rounded-full', TONE[p.tone].bg)} />
                ))}
              </div>
            </div>
          );
        })}
        {Array.from({ length: SPRINTS }, (_, i) => (
          <Reveal
            key={i}
            show={step >= 3}
            from="scale"
            delay={i * 0.05}
            className="absolute flex justify-center"
            style={{ left: TL_X + i * (CELL_W + CELL_GAP), top: CELL_TOP + CELL_H + 14, width: CELL_W }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success">
              <Eye size={24} />
            </span>
          </Reveal>
        ))}
      </Reveal>

      <StepCaption
        step={step}
        tone={step >= 2 ? 'ctrl' : step === 1 ? 'danger' : 'logic'}
        captions={[
          'Водопад: каждый этап — один раз и по очереди',
          'Пользователь видит продукт только через полгода',
          'Итерации: каждые 2 недели — небольшой, но готовый кусок',
          'Показываем каждые 2 недели — ошибку видно рано, исправить дёшево',
        ]}
      />
    </SlideLayout>
  );
}

function Lane({
  top,
  h,
  icon: Icon,
  tone,
  title,
  sub,
  active,
}: {
  top: number;
  h: number;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  sub: string;
  active?: boolean;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn('card absolute flex flex-col justify-center gap-3 px-6 transition-shadow duration-300', active && t.ring)}
      style={{ left: 0, top, width: LABEL_W, height: h }}
    >
      <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', t.soft, t.text)}>
        <Icon size={32} />
      </span>
      <div className="text-[30px] font-bold leading-tight">{title}</div>
      <div className="text-[19px] leading-snug text-text-2">{sub}</div>
    </div>
  );
}
