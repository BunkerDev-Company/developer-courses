'use client';

import { motion } from 'framer-motion';
import { Ban } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import type { SlideProps } from '@/types';
import { codeH } from '../parts';

/**
 * История настоящая (комментарий в …_run-active-index-fix-up.sql):
 * 0 — в миграции runs: частичный уникальный индекс «активный забег — один»
 * 1 — prisma:pull прочитал его как связь 1:1: у игрока один забег на всю жизнь
 * 2 — поправить старую миграцию? Нельзя: она уже применена у коллег и на проде
 * 3 — новая миграция: составной ключ → Prisma видит Run[]
 */

const OLD_INDEX = `-- ЧАСТИЧНЫЙ уникальный индекс: …
CREATE UNIQUE INDEX idx_run_one_active_per_user
    ON "Run" (user_id) WHERE status = 'active';`;

// Из комментария в начале …_run-active-index-fix-up.sql — дословно.
const PULLED_WRONG = `model Run  { user_id String @unique(where: ...) }
model User { Run Run? }          <- связь ОДИН-К-ОДНОМУ`;

const FIX_UP = `DROP INDEX idx_run_one_active_per_user;

CREATE UNIQUE INDEX idx_run_one_active_per_user
    ON "Run" (user_id, status) WHERE status = 'active';`;

// Текущий schema.prisma — выдержка.
const PULLED_RIGHT = `model Run {
  …
  @@unique([user_id, status],
           map: "idx_run_one_active_per_user", …)
}
model User {
  …
  Run               Run[]
}`;

const W = 690;
const RX = 1440 - W;
const LOW = 214;

export function FixSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="migrations" title="Применённую миграцию не правят">
      <motion.div className="absolute" style={{ left: 0, top: 0, width: W }} initial={false} animate={{ opacity: step === 3 ? 0.4 : 1 }}>
        <Code code={OLD_INDEX} lang="sql" size="sm" title="…_runs-up.sql" hl={step === 0 ? [2, 3] : undefined} tone="git" />
      </motion.div>

      <Arrow show={step >= 1} from={[W + 6, 100]} to={[RX - 8, 100]} tone={step === 1 ? 'prisma' : 'muted'} width={3} />
      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: RX, top: 0, width: W }}>
        <motion.div initial={false} animate={{ opacity: step === 3 ? 0.4 : 1 }} transition={{ duration: 0.35, ease: EASE }}>
          <Code code={PULLED_WRONG} lang="prisma" size="sm" title="после prisma:pull — schema.prisma" hl={[2]} tone="danger" />
        </motion.div>
      </Reveal>

      <div className="absolute" style={{ left: 0, top: LOW, width: W }}>
        <Swap k={step < 3 ? 'no' : 'fix'}>
          {step < 3 ? (
            <Reveal show={step === 2} from="up">
              <div className="rounded-2xl border-2 border-dashed border-danger/50 bg-danger/5 px-6 py-5">
                <div className="flex items-center gap-3 text-[26px] font-bold text-danger">
                  <Ban size={30} /> Поправить <M>…_runs-up.sql</M>?
                </div>
                <div className="mt-3 flex flex-col gap-2 text-[23px] leading-snug">
                  <span>Она уже есть в базах коллег и на проде.</span>
                  <span>node-pg-migrate её повторно не запустит — правка никуда не попадёт.</span>
                  <span className="font-semibold">Ошибся — пиши новую миграцию.</span>
                </div>
              </div>
            </Reveal>
          ) : (
            <Code code={FIX_UP} lang="sql" size="sm" title="…_run-active-index-fix-up.sql — новая" hl={[3, 4]} tone="success" />
          )}
        </Swap>
      </div>

      <Arrow show={step === 3} from={[W + 6, LOW + codeH(4) / 2]} to={[RX - 8, LOW + codeH(4) / 2]} tone="prisma" width={3} />
      <Reveal show={step === 3} from="left" className="absolute" style={{ left: RX, top: LOW, width: W }}>
        <Code code={PULLED_RIGHT} lang="prisma" size="sm" title="после prisma:pull — schema.prisma сейчас" hl={[3, 4, 8]} tone="success" />
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 1 || step === 2 ? 'danger' : step === 3 ? 'success' : 'git'}
        captions={[
          'Миграция runs: у игрока активный забег может быть только один',
          <>
            Prisma решила иначе: <M>Run Run?</M> — один забег на всю жизнь
          </>,
          'Поправить старую миграцию нельзя: она уже применена у всех',
          <>
            Новая миграция: ключ <M>(user_id, status)</M> — и в схеме снова <M>Run[]</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
