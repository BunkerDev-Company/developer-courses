'use client';

import { TriangleAlert } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { ROLES, type RoleKey } from '../request/restaurant';

/**
 * Новый эндпоинт GET /api/v1/items/count — по работнику на шаг:
 * 0 — чек (Query), 1 — повар (Handler), 2 — раздача (регистрация), 3 — официант (метод контроллера),
 * 4 — проверка + ловушка: метод ниже @Get(':id') → 'count' примут за id → 400 (проверено на etalon).
 */

const ROWS: { role: RoleKey; file: string; code: string }[] = [
  { role: 'ticket', file: 'item.queries.ts', code: 'export class CountItemsQuery {}' },
  {
    role: 'cook',
    file: 'item-queries.handler.ts',
    code: `@QueryHandler(CountItemsQuery)
export class CountItemsHandler implements IQueryHandler<CountItemsQuery> {
  constructor(private readonly prisma: PrismaService) {}
  async execute() { return { total: await this.prisma.item.count() }; }
}`,
  },
  {
    role: 'pass',
    file: 'app.module.ts',
    code: 'const QueryHandlers = [GetMeHandler, ListItemsHandler, GetItemHandler, CountItemsHandler];',
  },
  {
    role: 'waiter',
    file: 'items.controller.ts',
    code: `@Get('count') // выше, чем @Get(':id')!
count() {
  return this.queryBus.execute(new CountItemsQuery());
}`,
  },
];

const TOP = 64;
const GAP = 12;
const LH = 19 * 1.55;
const rowH = (code: string) => 32 + code.split('\n').length * LH;
const ROW_TOPS = ROWS.reduce<number[]>((acc, r, i) => [...acc, i === 0 ? TOP : acc[i - 1] + rowH(ROWS[i - 1].code) + GAP], []);
const LABEL_W = 330;
const CODE_X = 350;

export function RecipeSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Рецепт: новый эндпоинт">
      {/* Задача */}
      <div className="absolute flex items-center gap-4" style={{ left: 0, top: 0, height: 48 }}>
        <span className="text-[24px] font-semibold text-text-2">Задача:</span>
        <Chip tone="ctrl" solid>
          GET /api/v1/items/count
        </Chip>
        <Swap k={step === 4 ? 'done' : 'todo'}>
          {step === 4 ? (
            <Chip tone="success">200 · {'{ "data": { "total": 12 }, … }'}</Chip>
          ) : (
            <span className="text-[24px] font-semibold">→ сколько всего товаров</span>
          )}
        </Swap>
      </div>

      {ROWS.map((r, i) => {
        const role = ROLES[r.role];
        const t = TONE[role.tone];
        const current = step === i;
        return (
          <Reveal key={r.file} show={step >= i} from="up" className="absolute" style={{ left: 0, top: ROW_TOPS[i], width: 1440 }}>
            <div className="flex gap-5">
              <div className="flex shrink-0 items-start gap-3 pt-1.5" style={{ width: LABEL_W }}>
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                  <role.icon size={26} />
                </div>
                <div className="min-w-0">
                  <div className="text-[24px] font-bold leading-tight">
                    <span className="text-muted">{i + 1}.</span> {role.name}
                  </div>
                  <div className="truncate font-mono text-[16px] text-text-2">{r.file}</div>
                </div>
              </div>
              <Code
                code={r.code}
                lang="ts"
                size="sm"
                hl={current ? r.code.split('\n').map((_, n) => n + 1) : undefined}
                tone={role.tone}
                style={{ width: 1440 - CODE_X }}
              />
            </div>
          </Reveal>
        );
      })}

      {/* Ловушка порядка маршрутов */}
      <Reveal show={step === 4} from="left" className="absolute" style={{ right: 16, top: ROW_TOPS[3] + 12 }}>
        <Chip tone="danger" icon={TriangleAlert}>
          ниже :id → 400 «uuid is expected»
        </Chip>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 4 ? 'success' : ROLES[ROWS[Math.min(step, 3)].role].tone}
        captions={[
          'Чек: новый класс-вопрос. Полей нет — спрашиваем про все товары',
          <>
            Повар: считает через <M>prisma.item.count()</M>
          </>,
          'Раздача: записываем повара в QueryHandlers — иначе 500',
          <>
            Официант: <M>{"@Get('count')"}</M> ставим выше <M>{"@Get(':id')"}</M>
          </>,
          'Проверка: 200 и { total }. Ниже :id — «count» примут за id',
        ]}
      />
    </SlideLayout>
  );
}
