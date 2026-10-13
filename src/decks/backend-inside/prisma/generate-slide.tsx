'use client';

import { ArrowRight, WandSparkles } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { GEN_MODEL, GEN_TYPE_CREATE, GEN_TYPE_ITEM, ITEM_DELEGATE_SHOWN, ITEM_DELEGATE_TOTAL } from './data';
import { Editor, type Suggestion } from './editor';

/**
 * 0 — model Item → prisma generate → типы Item и Prisma.ItemCreateInput
 * 1 — редактор: this.prisma.item. → список методов
 * 2 — data: { ti → подсказка поля title
 * 3 — опечатка titel → красное подчёркивание и ошибка TS2561
 */

const HEAD = 'async execute(command: CreateItemCommand) {';

const EDITOR_CODE: Record<number, string> = {
  1: `${HEAD}\n  const item = await this.prisma.item.\n}`,
  2: `${HEAD}\n  const item = await this.prisma.item.create({\n    data: {\n      ti\n    },\n  });\n}`,
  3: `${HEAD}\n  const item = await this.prisma.item.create({\n    data: {\n      titel: 'Кружка',\n      price: 350,\n    },\n  });\n}`,
};

// Подсказка после точки: 8 из 18 методов по алфавиту, остальные — строкой внизу.
const METHODS: Suggestion[] = ITEM_DELEGATE_SHOWN.filter((m) => m !== 'aggregate' && m !== 'upsert').map((m) => ({
  label: m,
  kind: 'method',
}));

const DELEGATE = `interface ItemDelegate {
  count(…)
  create(…)
  findMany(…)
  findUnique(…)
  update(…)
  // … всего ${ITEM_DELEGATE_TOTAL}
}`;

const CREATE_INPUT = `type ItemCreateInput = {
  id?: string
  title: string
  description?: string | null
  // …
}`;

// Сцена А: модель слева, два типа справа.
const TYPES_X = 650;
const TYPES_W = 460;

export function GenerateSlide({ step }: SlideProps) {
  const gen = step === 0;

  return (
    <SlideLayout section="prisma" title={<><M>generate</M>: модель → типы → подсказки</>}>
      {/* ── Сцена А: генерация ── */}
      <Reveal show={gen} from="none" className="absolute inset-0">
        <Code
          code={GEN_MODEL}
          lang="prisma"
          size="sm"
          tone="prisma"
          title="schema.prisma"
          className="absolute"
          style={{ left: 0, top: 110, width: 520 }}
        />
        <Arrow show={gen} from={[530, 220]} to={[TYPES_X - 6, 112]} curve={-22} tone="prisma" flow label="generate" labelOffset={[-4, -10]} />
        <Arrow show={gen} from={[530, 286]} to={[TYPES_X - 6, 380]} curve={22} tone="prisma" flow delay={0.2} />

        <Code code={GEN_TYPE_ITEM} lang="ts" size="sm" tone="logic" className="absolute" style={{ left: TYPES_X, top: 0, width: TYPES_W }} />
        <Code code={GEN_TYPE_CREATE} lang="ts" size="sm" tone="logic" className="absolute" style={{ left: TYPES_X, top: 262, width: TYPES_W }} />
        <Note top={52} name="Item">
          что вернёт <M>findMany</M> — строка из базы
        </Note>
        <Note top={314} name="Prisma.ItemCreateInput">
          что можно передать в <M>create</M>
        </Note>
      </Reveal>

      {/* ── Сцена Б: редактор ── */}
      <Reveal show={!gen} from="up" className="absolute inset-0">
        <div className="absolute flex items-center gap-3" style={{ left: 0, top: 0 }}>
          <Chip tone="prisma">model Item</Chip>
          <ArrowRight size={26} className="text-muted" />
          <Chip tone="prisma" solid icon={WandSparkles}>
            prisma generate
          </Chip>
          <ArrowRight size={26} className="text-muted" />
          <Chip tone="logic">Item</Chip>
          <Chip tone="logic">Prisma.ItemCreateInput</Chip>
          <Chip tone="logic">Prisma.ItemDelegate</Chip>
          <span className="text-[22px] text-text-2">…</span>
        </div>

        <div className="absolute" style={{ left: 0, top: 72, width: 960 }}>
          {!gen && (
            <Editor
              file="item-commands.handler.ts"
              code={EDITOR_CODE[step]}
              rows={11}
              cursor={step === 1 ? { line: 2, col: 38 } : step === 2 ? { line: 4, col: 8 } : undefined}
              popup={
                step === 1
                  ? {
                      line: 2,
                      col: 38,
                      items: METHODS,
                      selected: 1,
                      footer: `и ещё ${ITEM_DELEGATE_TOTAL - METHODS.length}: aggregate, groupBy, upsert…`,
                    }
                  : step === 2
                    ? { line: 4, col: 6, match: 2, items: [{ label: 'title', kind: 'field', detail: 'string' }] }
                    : undefined
              }
              squiggle={step === 3 ? { line: 4, col: 6, len: 5 } : undefined}
              problem={
                step === 3
                  ? {
                      text: (
                        <>
                          Object literal may only specify known properties, but <b>&apos;titel&apos;</b> does not exist in
                          type &apos;(Without&lt;ItemCreateInput, …&gt; &amp; …)&apos;. Did you mean to write{' '}
                          <b>&apos;title&apos;</b>?
                        </>
                      ),
                      where: 'ts(2561) [Ln 4, Col 7]',
                    }
                  : undefined
              }
            />
          )}
        </div>

        {/* Справа: откуда редактор это знает */}
        <div className="absolute" style={{ left: 1000, top: 72, width: 440 }}>
          <div className="mb-3 text-[18px] font-semibold uppercase tracking-wider text-muted">Откуда знает</div>
          <Swap k={step === 1 ? 'delegate' : 'input'}>
            {step === 1 ? (
              <Code code={DELEGATE} lang="ts" size="sm" tone="logic" title="this.prisma.item" hl={[2, 3, 4, 5, 6]} />
            ) : (
              <Code
                code={CREATE_INPUT}
                lang="ts"
                size="sm"
                tone={step === 3 ? 'danger' : 'logic'}
                title="data: ItemCreateInput"
                hl={[3]}
              />
            )}
          </Swap>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 3 ? 'danger' : 'prisma'}
        captions={[
          'generate превращает модель в TypeScript-типы',
          'Ставишь точку — редактор знает все методы',
          'Внутри data — знает поля таблицы',
          'Опечатка видна в редакторе, а не на проде',
        ]}
      />
    </SlideLayout>
  );
}

/** Подпись справа от типа: имя типа и зачем он. */
function Note({ top, name, children }: { top: number; name: string; children: React.ReactNode }) {
  return (
    <div className="absolute" style={{ left: TYPES_X + TYPES_W + 28, top, width: 1440 - TYPES_X - TYPES_W - 28 }}>
      <Chip tone="logic">{name}</Chip>
      <div className="mt-3 text-[24px] leading-snug text-text-2">{children}</div>
    </div>
  );
}
