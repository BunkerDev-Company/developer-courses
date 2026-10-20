'use client';

import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Cpu, Database, Sparkles } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Console } from '../parts';

/**
 * «Рецепт: новое оружие» из CLAUDE.md игры — по шагу на клик:
 * 0 — механика в симуляции, 1 — картинка в протоколе, 2 — строка каталога миграцией данных, 3 — проверка
 */

const PHASES: { tone: Tone; icon: LucideIcon; title: string; what: string; where: string }[] = [
  { tone: 'logic', icon: Cpu, title: 'Механика', what: 'registerWeapon({ code, … })', where: 'domain/sim/weapons/*.ts' },
  { tone: 'warning', icon: Sparkles, title: 'Картинка', what: 'новый вид — в конец FX', where: 'shared/fx.ts + фронт' },
  { tone: 'git', icon: Database, title: 'Каталог', what: 'строка → миграция данных', where: 'content/items.ts' },
  { tone: 'success', icon: CheckCircle2, title: 'Проверка', what: 'npm run weapons:check', where: 'каждое оружие отдельно' },
];

// domain/sim/weapons/starter.ts — выдержка.
const WEAPON = `export const crossbow = registerWeapon({
  code: 'crossbow',
  element: 'physical',
  defaults: { damage: [10, 12, 14, 17, 21], … },
  fire(ctx) { … },
});`;

const CARD_W = 330;
const GAP = 40;
const BOTTOM = 300;

export function WeaponRecipeSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Рецепт: новое оружие">
      <div className="absolute flex" style={{ left: 0, top: 0, gap: GAP }}>
        {PHASES.map((p, i) => {
          const t = TONE[p.tone];
          return (
            <Reveal key={p.title} show={step >= i} from="up" style={{ width: CARD_W }}>
              <div className={cn('card flex h-[260px] flex-col border-t-[6px] px-6 py-5 transition-shadow duration-300', t.border, step === i && t.ring)}>
                <div className="flex items-center gap-3">
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl', t.soft, t.text)}>
                    <p.icon size={26} />
                  </span>
                  <span className="text-[17px] font-bold text-muted">0{i + 1}</span>
                  <span className="text-[28px] font-bold">{p.title}</span>
                </div>
                <div className={cn('mt-4 font-mono text-[19px] font-semibold leading-snug', t.text)}>{p.what}</div>
                <div className="mt-auto font-mono text-[17px] text-text-2">{p.where}</div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="absolute" style={{ left: 0, top: BOTTOM, width: 1440 }}>
        <Swap k={step}>
          {step === 0 && <Code code={WEAPON} lang="ts" size="sm" title="domain/sim/weapons/starter.ts — стартовый арбалет" hl={[1, 2, 4, 5]} tone="logic" />}
          {step === 1 && (
            <Console
              title="CLAUDE.md игры — протокол append-only"
              lines={[
                { text: 'порядок в MOB_TYPES, FX, STATUSES, ELEMENTS, PICKUPS, REACTIONS, SOUNDS — часть бинарного формата', kind: 'out' },
                { text: 'новое — в конец; ломающее — SNAPSHOT_VERSION', kind: 'ok' },
                { text: 'поменяли src/domain/shared/* → во фронте npm run sync:shared', kind: 'dim' },
              ]}
            />
          )}
          {step === 2 && (
            <Console
              title="справочник — из кода: один источник правды с механикой"
              lines={[
                { text: '$ npx tsx scripts/gen-catalog-sql.ts 20261015110000_item-catalog-100', kind: 'out' },
                { text: '-- СГЕНЕРИРОВАНО scripts/gen-catalog-sql.ts из src/domain/sim/content/items.ts —', kind: 'dim' },
                { text: '-- руками не править.', kind: 'dim' },
                { text: '# ВАЖНО: применённую миграцию не правят. … — нужна НОВАЯ миграция (UPDATE/INSERT)', kind: 'ok' },
              ]}
            />
          )}
          {step === 3 && (
            <Console
              title="без сервера и базы — реальный вывод"
              lines={[
                { text: '$ npm run weapons:check', kind: 'out' },
                { text: 'Каталог: 100 (оружий 42, пассивок 33, эволюций 25); FX видов: 100', kind: 'dim' },
                { text: 'код              стихия     ур  один  отряд  толпа убийств   тик  макс  снар  зон  соб  заметки', kind: 'dim' },
                { text: 'crossbow         physical    1    15     15     15       6  0.06   1.0     1    0    4', kind: 'out' },
                { text: 'crossbow         physical    5   118    145    312      62  0.04   0.4     6    0   15', kind: 'out' },
                { text: 'weapons:check — всё в порядке ✓', kind: 'ok' },
              ]}
            />
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={PHASES[Math.min(step, 3)].tone}
        captions={[
          'Механика — в симуляции: числа в defaults, поведение в fire()',
          'Новый эффект на экране — в конец списка FX: формат снимка append-only',
          'Строка каталога — миграцией данных, SQL генерируется из кода',
          'Проверка без сервера: каждое оружие в отдельной симуляции',
        ]}
      />
    </SlideLayout>
  );
}
