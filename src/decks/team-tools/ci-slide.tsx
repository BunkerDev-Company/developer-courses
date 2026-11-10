'use client';

import type { LucideIcon } from 'lucide-react';
import { CircleCheck, CircleX, GitMerge, LoaderCircle, Rocket } from 'lucide-react';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Проверки PR. Скрипты lint и build — настоящие из etalon-backend/package.json,
 * шаги деплоя — из etalon-backend/.github/workflows/deploy.yml.
 * 0 проверки идут → 1 lint упал → 2 починили, всё зелёное → 3 merge запускает deploy.
 */

type State = 'run' | 'ok' | 'fail';

const STATE: Record<State, { icon: LucideIcon; tone: Tone; label: string }> = {
  run: { icon: LoaderCircle, tone: 'warning', label: 'выполняется' },
  ok: { icon: CircleCheck, tone: 'success', label: 'успешно' },
  fail: { icon: CircleX, tone: 'danger', label: 'ошибка' },
};

const CHECKS: { name: string; cmd: string; states: State[] }[] = [
  { name: 'lint', cmd: 'npm run lint', states: ['run', 'fail', 'ok', 'ok'] },
  { name: 'build', cmd: 'npm run build', states: ['run', 'ok', 'ok', 'ok'] },
];

const LINT_HEAD: TermLine[] = [
  { text: 'npm run lint', kind: 'cmd' },
  { text: '' },
  { text: '> etalon-backend@0.1.0 lint', kind: 'dim' },
  { text: '> eslint "{src,scripts}/**/*.ts"', kind: 'dim' },
];

const LOGS: { title: string; lines: TermLine[] }[] = [
  { title: 'GitHub Actions · lint', lines: LINT_HEAD },
  {
    title: 'GitHub Actions · lint',
    lines: [
      ...LINT_HEAD,
      { text: '' },
      { text: '/home/runner/work/backend/backend/src/application/handlers/item-commands.handler.ts' },
      { text: "  34:11  error  'oldPrice' is assigned a value but never used  @typescript-eslint/no-unused-vars", kind: 'err' },
      { text: '' },
      { text: '✖ 1 problem (1 error, 0 warnings)', kind: 'err' },
    ],
  },
  {
    title: 'GitHub Actions · lint, build',
    lines: [
      ...LINT_HEAD,
      { text: '' },
      { text: 'npm run build', kind: 'cmd' },
      { text: '' },
      { text: '> etalon-backend@0.1.0 build', kind: 'dim' },
      { text: '> nest build', kind: 'dim' },
    ],
  },
  {
    title: 'GitHub Actions · deploy',
    lines: [
      { text: '✓ Checkout', kind: 'ok' },
      { text: '✓ Prepare SSH', kind: 'ok' },
      { text: '✓ Sync source to server', kind: 'ok' },
      { text: '✓ Rebuild & restart', kind: 'ok' },
    ],
  },
];

const PANEL_H = 226;

export function CiSlide({ step }: SlideProps) {
  const green = step >= 2;
  const merged = step >= 3;
  const log = LOGS[Math.min(step, LOGS.length - 1)];

  return (
    <SlideLayout section="code" title="CI: робот проверяет каждый PR">
      <div className="card absolute flex gap-6 px-6 py-5" style={{ left: 0, top: 0, width: 1440, height: PANEL_H }}>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="text-[22px] font-bold">
            PR #52 · проверки <span className="font-normal text-text-2">— запускаются на каждый push</span>
          </div>
          {CHECKS.map((c) => (
            <CheckRow key={c.name} name={c.name} cmd={c.cmd} state={c.states[step]} />
          ))}
          <Reveal show={merged} from="up">
            <div className="flex items-center gap-4 text-[22px]">
              <Rocket size={26} className="shrink-0 text-ctrl" />
              <span className="w-[90px] font-mono font-semibold">deploy</span>
              <span className="text-text-2">
                <M>deploy.yml</M>: push в main → сервер
              </span>
            </div>
          </Reveal>
        </div>

        <div className="flex w-[360px] shrink-0 flex-col items-stretch justify-center gap-3 border-l-2 border-border pl-6">
          <Swap k={merged ? 'merged' : green ? 'ready' : step === 1 ? 'fail' : 'wait'}>
            <div
              className={cn(
                'flex items-center justify-center gap-3 rounded-xl px-5 py-4 text-[24px] font-bold',
                merged ? 'bg-git text-white' : green ? 'bg-success text-white' : 'bg-surface-3 text-muted',
              )}
            >
              <GitMerge size={26} />
              {merged ? 'Влито в main' : green ? 'Merge pull request' : 'Merge недоступен'}
            </div>
          </Swap>
          <div className="text-center text-[19px] leading-snug text-text-2">
            {merged ? 'деплой запустился сам' : green ? 'все проверки пройдены' : step === 1 ? 'сначала почините lint' : 'ждём проверок'}
          </div>
        </div>
      </div>

      <Terminal lines={log.lines} title={log.title} size="sm" className="absolute" style={{ left: 0, top: PANEL_H + 22, width: 1440, height: 300 }} />

      <StepCaption
        step={step}
        tone={step === 1 ? 'danger' : step === 3 ? 'ctrl' : step === 2 ? 'success' : 'warning'}
        captions={[
          'CI (непрерывная интеграция) проверяет код на каждый push',
          'Lint нашёл ошибку — влить нельзя, пока не починят',
          'Починили, запушили — проверки зелёные, merge открыт',
          'CD: после merge в main деплой запускается сам',
        ]}
      />
    </SlideLayout>
  );
}

function CheckRow({ name, cmd, state }: { name: string; cmd: string; state: State }) {
  const s = STATE[state];
  const t = TONE[s.tone];
  return (
    <div className="flex items-center gap-4 text-[22px]">
      <Swap k={state}>
        <s.icon size={26} className={cn('shrink-0', t.text, state === 'run' && 'animate-spin')} />
      </Swap>
      <span className="w-[90px] font-mono font-semibold">{name}</span>
      <span className="font-mono text-[20px] text-text-2">{cmd}</span>
      <span className={cn('ml-auto text-[20px] font-semibold', t.text)}>{s.label}</span>
    </div>
  );
}
