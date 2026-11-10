'use client';

import { motion } from 'framer-motion';
import { GitMerge, GitPullRequest, Ticket } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE, TASK } from '../it-company/data';
import { Avatar } from '../it-company/parts';
import { Pill } from '../what-is-backend/parts';

/**
 * Git-граф + терминал + карточка задачи.
 * 0 main → 1 своя ветка → 2 коммиты (а в main тем временем влили чужое) → 3 push и pull request → 4 merge.
 */

const BRANCH = 'feature/PROMO-12-promo-code';

const LINES: TermLine[][] = [
  [{ text: 'git pull', kind: 'cmd' }, { text: 'Already up to date.' }],
  [{ text: `git switch -c ${BRANCH}`, kind: 'cmd' }, { text: `Switched to a new branch '${BRANCH}'` }],
  [
    { text: 'git add .', kind: 'cmd' },
    { text: 'git commit -m "PROMO-12: проверка промокода"', kind: 'cmd' },
    { text: `[${BRANCH} 3f9c2a1] PROMO-12: проверка промокода` },
    { text: ' 2 files changed, 48 insertions(+), 3 deletions(-)' },
  ],
  [
    { text: `git push -u origin ${BRANCH}`, kind: 'cmd' },
    { text: `remote: Create a pull request for '${BRANCH}' on GitHub by visiting:`, kind: 'dim' },
    { text: `remote:      https://github.com/shop/backend/pull/new/${BRANCH}`, kind: 'dim' },
    { text: 'To github.com:shop/backend.git', kind: 'dim' },
    { text: ` * [new branch]      ${BRANCH} -> ${BRANCH}`, kind: 'ok' },
  ],
];

const STATUS: { label: string; tone: Tone }[] = [
  { label: 'К работе', tone: 'muted' },
  { label: 'В работе', tone: 'accent' },
  { label: 'В работе', tone: 'accent' },
  { label: 'Ревью', tone: 'git' },
  { label: 'Тест', tone: 'success' },
];

const MAIN_Y = 150;
const BR_Y = 62;
const FORK_X = 200;
const BR_END = 900;
const MERGE_X = 1150;

export function BranchSlide({ step }: SlideProps) {
  const lines = LINES.slice(0, Math.min(step, LINES.length - 1) + 1).flat();
  const st = STATUS[step];

  return (
    <SlideLayout section="code" title="Ветка задачи и pull request">
      <svg className="absolute left-0 top-0 overflow-visible" width={1440} height={200}>
        <line x1={30} y1={MAIN_Y} x2={1410} y2={MAIN_Y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
        <text x={30} y={MAIN_Y + 44} className="fill-text-2 font-mono text-[20px] font-semibold">
          main
        </text>

        <Draw
          show={step >= 1}
          d={`M ${FORK_X} ${MAIN_Y} C ${FORK_X + 60} ${MAIN_Y}, ${FORK_X + 40} ${BR_Y}, ${FORK_X + 120} ${BR_Y} L ${BR_END} ${BR_Y}`}
        />
        <motion.text
          x={FORK_X + 140}
          y={BR_Y - 22}
          className="fill-git font-mono text-[20px] font-semibold"
          initial={false}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
        >
          {BRANCH}
        </motion.text>

        {/* PR: пунктир, потом настоящий merge */}
        <Draw show={step === 3} dashed d={`M ${BR_END} ${BR_Y} C ${BR_END + 140} ${BR_Y}, ${MERGE_X - 120} ${MAIN_Y}, ${MERGE_X} ${MAIN_Y}`} />
        <Draw show={step >= 4} d={`M ${BR_END} ${BR_Y} C ${BR_END + 140} ${BR_Y}, ${MERGE_X - 120} ${MAIN_Y}, ${MERGE_X} ${MAIN_Y}`} />

        <Commit x={80} y={MAIN_Y} tone="muted" />
        <Commit x={FORK_X} y={MAIN_Y} tone="muted" />
        <Commit x={620} y={MAIN_Y} tone="muted" show={step >= 2} label="Ян влил SHOP-28" />
        <Commit x={430} y={BR_Y} tone="git" show={step >= 2} />
        <Commit x={600} y={BR_Y} tone="git" show={step >= 2} />
        <Commit x={BR_END} y={BR_Y} tone="git" show={step >= 3} />
        <Commit x={MERGE_X} y={MAIN_Y} tone="success" show={step >= 4} big />
      </svg>

      <Terminal lines={lines} size="sm" className="absolute" style={{ left: 0, top: 232, width: 860, height: 318 }} />

      {/* Задача и PR */}
      <div className="card absolute flex flex-col gap-4 p-5" style={{ left: 890, top: 232, width: 550, height: 318 }}>
        <div className="flex items-center gap-2">
          <Ticket size={22} className="text-git" />
          <span className="font-mono text-[19px] font-semibold text-git">{TASK.key}</span>
          <span className="truncate text-[21px] font-bold">{TASK.title}</span>
        </div>
        <div className="flex items-center gap-3 text-[20px] text-text-2">
          статус:
          <Swap k={st.label}>
            <Pill tone={st.tone}>{st.label}</Pill>
          </Swap>
        </div>

        <Reveal show={step >= 3} from="up" className="mt-auto">
          <div className={cn('rounded-xl border-2 p-4', step >= 4 ? 'border-success/50' : TONE.git.borderSoft)}>
            <div className="flex items-center gap-2">
              {step >= 4 ? <GitMerge size={24} className="text-success" /> : <GitPullRequest size={24} className="text-git" />}
              <span className="text-[22px] font-bold">PR #48</span>
              <span className="ml-auto">
                <Swap k={step >= 4 ? 'merged' : 'open'}>
                  <Pill tone={step >= 4 ? 'success' : 'git'} solid={step >= 4}>
                    {step >= 4 ? 'влит в main' : 'ждёт ревью'}
                  </Pill>
                </Swap>
              </span>
            </div>
            <div className="mt-2 font-mono text-[16px] text-text-2">{BRANCH} → main</div>
            <div className="mt-3 flex items-center gap-2 text-[19px] text-text-2">
              ревьюеры:
              <Avatar name={PEOPLE.lead.name} role={PEOPLE.lead.role} size={34} />
              <Avatar name={PEOPLE.front.name} role={PEOPLE.front.role} size={34} />
            </div>
          </div>
        </Reveal>
      </div>

      <StepCaption
        step={step}
        tone={step >= 4 ? 'success' : 'git'}
        captions={[
          'main — общая ветка. Напрямую в неё не пишут',
          'На каждую задачу — своя ветка, ключ задачи в имени',
          'Коммиты с ключом задачи — трекер свяжет их сам',
          'Push и pull request: «посмотрите и влейте в main»',
          'После ревью и проверок — merge. Задача уходит в тест',
        ]}
      />
    </SlideLayout>
  );
}

function Draw({ d, show, dashed }: { d: string; show: boolean; dashed?: boolean }) {
  return (
    <motion.path
      d={d}
      fill="none"
      strokeWidth={6}
      strokeLinecap="round"
      strokeDasharray={dashed ? '12 12' : undefined}
      className="stroke-git"
      initial={false}
      // pathLength сам управляет штрихами — пунктир только проявляем.
      animate={dashed ? { opacity: show ? 1 : 0 } : { pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    />
  );
}

function Commit({ x, y, tone, show = true, label, big }: { x: number; y: number; tone: Tone; show?: boolean; label?: string; big?: boolean }) {
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.35, delay: show ? 0.3 : 0, ease: EASE }}>
      <circle cx={x} cy={y} r={big ? 17 : 13} strokeWidth={5} className={cn('fill-surface', TONE[tone].stroke)} />
      {label && (
        <text x={x} y={y + 46} textAnchor="middle" className="fill-text-2 text-[18px]">
          {label}
        </text>
      )}
    </motion.g>
  );
}
