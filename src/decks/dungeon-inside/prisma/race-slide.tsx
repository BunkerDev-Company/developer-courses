'use client';

import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Console } from '../parts';

/**
 * Шаги:
 * 0 — наивно: прочитать баланс, сравнить в JS, записать → две вкладки обе «прошли проверку»
 * 1 — как в игре: «списать, ЕСЛИ хватает» одним UPDATE … WHERE balance >= amount
 * 2 — вторая вкладка: строка не подошла под WHERE → count === 0
 * 3 — count === 0 → NOT_ENOUGH_GOLD, понятная ошибка игроку
 */

// wallet.service.ts — WalletService.debit, выдержка (data перенесена по ширине).
const DEBIT = `// «Списать, ЕСЛИ хватает» — одним UPDATE ... WHERE balance >= amount.
// Вариант «прочитать баланс, сравнить в JS, записать» — гонка: два запроса
// одновременно прочитают 100, оба решат, что хватает, оба спишут.
const { count } = await tx.wallet.updateMany({
  where: { user_id: userId, balance: { gte: amount } },
  data: {
    balance: { decrement: amount },
    date_update_at: new Date(),
  },
});
if (count === 0)
  this.errors.throw('NOT_ENOUGH_GOLD', \`Нужно \${amount} золота\`);`;

const HL = [[2, 3], [4, 5, 7], [5], [11, 12]];

const CODE_W = 910;

interface Ev {
  a?: string;
  b?: string;
  tone?: Tone;
}

/** Хронология двух вкладок одного игрока: баланс 100, обе покупают за 80. */
const NAIVE: Ev[] = [
  { a: 'читает 100', b: 'читает 100' },
  { a: '100 ≥ 80 — да', b: '100 ≥ 80 — да' },
  { a: 'пишет 20', b: 'пишет 20', tone: 'danger' },
];

const ATOMIC: Ev[] = [
  { a: 'UPDATE … ≥ 80', b: 'ждёт строку' },
  { a: 'count = 1 → 20', tone: 'success' },
  { b: 'нет: count = 0', tone: 'danger' },
];

function Timeline({ title, events, verdict, verdictTone }: { title: string; events: Ev[]; verdict: string; verdictTone: Tone }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b-2 border-border bg-surface-2 px-5 py-3 text-[22px] font-bold">{title}</div>
      <div className="grid grid-cols-2 border-b border-border px-5 py-2 text-[16px] font-semibold uppercase tracking-wider text-muted">
        <span>вкладка A</span>
        <span>вкладка B</span>
      </div>
      {events.map((e, i) => (
        <div key={i} className={cn('grid grid-cols-2 gap-4 border-b border-border/70 px-5 py-2.5 font-mono text-[19px]', e.tone && TONE[e.tone].soft)}>
          <span className={cn(e.tone && e.a && TONE[e.tone].text)}>{e.a ?? ''}</span>
          <span className={cn(e.tone && e.b && TONE[e.tone].text)}>{e.b ?? ''}</span>
        </div>
      ))}
      <div className={cn('px-5 py-3 text-[22px] font-semibold', TONE[verdictTone].text)}>{verdict}</div>
    </div>
  );
}

export function RaceSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="prisma" title="Гонка двух вкладок">
      <Code
        code={DEBIT}
        lang="ts"
        size="sm"
        title="application/services/wallet.service.ts — debit"
        hl={HL[step]}
        tone={step === 0 || step === 3 ? 'danger' : 'prisma'}
        className="absolute"
        style={{ left: 0, top: 0, width: CODE_W }}
      />

      <div className="absolute" style={{ left: CODE_W + 36, top: 0, width: 1440 - CODE_W - 36 }}>
        <Swap k={step === 0 ? 'naive' : step === 3 ? 'error' : 'atomic'}>
          {step === 0 && <Timeline title="Прочитать → сравнить → записать" events={NAIVE} verdict="Купили дважды — заплатили один раз" verdictTone="danger" />}
          {(step === 1 || step === 2) && (
            <Timeline title="Одним UPDATE" events={step === 1 ? ATOMIC.slice(0, 2) : ATOMIC} verdict={step === 1 ? 'Проверка и списание — один шаг' : 'Вторая не прошла WHERE'} verdictTone={step === 1 ? 'success' : 'danger'} />
          )}
          {step === 3 && (
            <Console
              title="ответ вкладке B"
              lines={[
                { text: '409', kind: 'dim' },
                { text: '"code": 71,', kind: 'err' },
                { text: '"message": "Not Enough Gold",', kind: 'err' },
                { text: '"details": "Нужно 80 золота"', kind: 'err' },
              ]}
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 0 || step === 3 ? 'danger' : 'prisma'}
        captions={[
          'Наивно: две вкладки одновременно прочитали 100 — обе решили, что хватает',
          <>
            В игре: <M>updateMany</M> с условием <M>balance ≥ amount</M> — один SQL-запрос
          </>,
          'База выполняет их по очереди: второй UPDATE не находит подходящей строки',
          <>
            <M>count === 0</M> → понятная ошибка <M>NOT_ENOUGH_GOLD</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
