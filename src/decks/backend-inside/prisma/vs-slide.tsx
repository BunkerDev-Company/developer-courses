'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  BookOpen,
  Database,
  FileCode2,
  Filter,
  OctagonAlert,
  PenLine,
  RefreshCw,
  ShieldCheck,
  SquareCode,
  Wrench,
} from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { NodeBox, type NodeState } from '@/components/ui/node-box';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Plate } from './parts';

/**
 * 0 — туториалы: schema.prisma руками → prisma migrate dev → SQL → база
 * 1 — у нас: SQL руками → migrate:up → база → db pull → schema.prisma
 * 2 — стрелки противоположны
 * 3 — почему так: индексы, CHECK, бэкфиллы, контроль над SQL
 * 4 — prisma migrate dev у нас не запускать
 */

const W = 260;
const X = { schema: 0, gen: 410, db: 820, sql: 1180 };
const TOP = 46; // верх блоков первого ряда
const BOT = 196; // верх блоков второго ряда
const C1 = TOP + 42; // центр по высоте
const C2 = BOT + 42;

const DRIFT: TermLine[] = [
  { text: 'npx prisma migrate dev', kind: 'cmd' },
  { text: 'Drift detected: Your database schema is not in sync with your', kind: 'err' },
  { text: 'migration history.', kind: 'err' },
  { text: 'We need to reset the "public" schema at "localhost:5432"', kind: 'out' },
  { text: 'You may use prisma migrate reset to drop the development database.', kind: 'dim' },
  { text: 'All data will be lost.', kind: 'err' },
];

const REASONS: { icon: typeof Filter; title: string; code: string }[] = [
  { icon: Filter, title: 'Частичные индексы', code: '… WHERE email IS NOT NULL' },
  { icon: ShieldCheck, title: 'CHECK-ограничения', code: 'CHECK (price >= 0)' },
  { icon: RefreshCw, title: 'Бэкфиллы данных', code: 'UPDATE "Item" SET …' },
  { icon: SquareCode, title: 'Полный контроль', code: 'что написал — то и выполнится' },
];

export function VsSlide({ step }: SlideProps) {
  const focus = step === 2;
  const top: NodeState = step === 1 ? 'dim' : 'idle';
  const bot = (n: 'schema' | 'db' | 'sql'): NodeState => (focus && n === 'sql' ? 'dim' : focus ? 'active' : 'idle');

  return (
    <SlideLayout section="prisma" title="В туториалах — наоборот">
      {/* ── Ряд 1: туториалы / Prisma Migrate ── */}
      <RowLabel show icon={BookOpen} tone="muted" top={TOP - 40}>
        Туториалы
      </RowLabel>
      <Box x={X.schema} y={TOP} tone="prisma" icon={PenLine} title="schema.prisma" sub="пишем руками" state={focus ? 'active' : top} />
      <Box x={X.gen} y={TOP} tone="muted" icon={FileCode2} title="migration.sql" sub="генерирует Prisma" state={focus ? 'dim' : top} />
      <Box x={X.db} y={TOP} tone="db" icon={Database} title="PostgreSQL" sub="база" state={focus ? 'active' : top} />
      <Arrow
        from={[X.schema + W + 6, C1]}
        to={[X.gen - 8, C1]}
        tone={step === 4 ? 'danger' : step === 1 ? 'muted' : 'prisma'}
        label="prisma migrate dev"
        labelOffset={[0, -62]}
        flow={step === 0 || focus}
      />
      <Arrow from={[X.gen + W + 6, C1]} to={[X.db - 8, C1]} tone={step === 1 ? 'muted' : 'prisma'} flow={step === 0 || focus} delay={0.2} />

      {/* ── Ряд 2: у нас ── */}
      <RowLabel show={step >= 1} icon={Wrench} tone="prisma" top={BOT - 40}>
        У нас
      </RowLabel>
      <Reveal show={step >= 1} from="up">
        <Box x={X.sql} y={BOT} tone="git" icon={PenLine} title="SQL-миграция" sub="пишем руками" state={bot('sql')} />
        <Box x={X.db} y={BOT} tone="db" icon={Database} title="PostgreSQL" sub="база" state={bot('db')} />
        <Box x={X.schema} y={BOT} tone="prisma" icon={FileCode2} title="schema.prisma" sub="генерируется" state={bot('schema')} />
      </Reveal>
      <Arrow
        show={step >= 1}
        from={[X.sql - 6, C2]}
        to={[X.db + W + 8, C2]}
        tone="git"
        label="migrate:up"
        labelOffset={[0, 62]}
        flow={step === 1}
        delay={0.3}
      />
      <Arrow show={step >= 1} from={[X.db - 6, C2]} to={[X.schema + W + 8, C2]} tone="prisma" label="db pull" flow={step === 1 || focus} delay={0.5} />

      {/* Шаг 2: направления противоположны */}
      <Reveal show={focus} from="scale" className="absolute" style={{ left: 330, top: 128, width: 420 }}>
        <div className="flex items-center justify-center gap-3 rounded-full border-2 border-prisma bg-surface px-5 py-1.5 text-[22px] font-semibold text-prisma shadow-card">
          <ArrowLeftRight size={24} />
          стрелки противоположны
        </div>
      </Reveal>

      {/* ── Низ: почему / предупреждение ── */}
      <div className="absolute" style={{ left: 0, top: 336, width: 1440 }}>
        <Swap k={step >= 4 ? 'warn' : step === 3 ? 'why' : 'none'}>
          {step === 3 && <Why />}
          {step >= 4 && (
            <div className="flex gap-7">
              <Terminal lines={DRIFT} size="sm" style={{ width: 860, height: 216 }} />
              <Plate tone="danger" icon={OctagonAlert} className="flex-1 self-start">
                У нас <M>prisma migrate dev</M> не запускать
                <div className="mt-2 text-[20px] font-normal text-text-2">
                  увидит «чужую» историю и предложит сбросить базу — вместе с данными
                </div>
              </Plate>
            </div>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 4 ? 'danger' : 'prisma'}
        captions={[
          'В туториалах пишут schema.prisma, а SQL делает Prisma',
          'У нас наоборот: пишем SQL, а schema.prisma читаем из базы',
          'Источник правды у нас — SQL-миграции',
          'Почему: SQL умеет то, чего не опишешь в schema.prisma',
          'migrate dev у нас — путь к пустой базе',
        ]}
      />
    </SlideLayout>
  );
}

function Why() {
  return (
    <div className="flex gap-7">
      <div className="grid flex-1 grid-cols-2 gap-4">
        {REASONS.map((r) => (
          <div key={r.title} className="card flex items-center gap-4 px-5 py-3.5">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', TONE.git.soft, TONE.git.text)}>
              <r.icon size={26} />
            </div>
            <div className="min-w-0">
              <div className="text-[22px] font-semibold leading-tight">{r.title}</div>
              <div className="mt-1 truncate font-mono text-[16px] text-text-2">{r.code}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-[540px] overflow-hidden rounded-2xl bg-code-bg shadow-lift ring-1 ring-code-line/10">
        <div className="border-b border-code-line/10 px-5 py-2.5 font-mono text-[16px] text-code-text/70">schema.prisma · эталон</div>
        <div className="px-5 py-3 font-mono text-[17px] leading-[1.5]">
          <div className="text-code-comment">
            {'/// This table contains check constraints and '}
            <span className="rounded bg-warning/25 px-1 text-code-text">requires additional setup</span> for migrations. Visit
            https://pris.ly/d/check-constraints for more info.
          </div>
          <div className="mt-1">
            <span className="text-code-keyword">model</span> <span className="text-code-type">User</span>{' '}
            <span className="text-code-text">{'{'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RowLabel({ show, icon: Icon, tone, top, children }: { show: boolean; icon: typeof Filter; tone: Tone; top: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      className={cn('eyebrow absolute flex items-center gap-2', tone === 'muted' ? 'text-text-2' : TONE[tone].text)}
      style={{ left: 0, top }}
    >
      <Icon size={22} />
      {children}
    </motion.div>
  );
}

function Box({
  x,
  y,
  ...props
}: { x: number; y: number } & Omit<React.ComponentProps<typeof NodeBox>, 'className' | 'style' | 'size'>) {
  return <NodeBox {...props} size="sm" className="absolute" style={{ left: x, top: y, width: W }} />;
}
