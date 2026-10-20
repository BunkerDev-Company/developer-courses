'use client';

import { ChefHat, ReceiptText } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { ROLES, type RoleKey } from '../request/restaurant';

/**
 * Шаги — по работнику зала, затем чек уходит на кухню:
 * 0 — охранник (guards), 1 — хостес (роутинг), 2 — официант (контроллер), 3 — чек → кухня
 */

const CARDS: { role: RoleKey; does: string; code: string; fail: string; failTone: Tone }[] = [
  { role: 'guard', does: 'проверяет токен и роль', code: '@UseGuards · @Roles', fail: 'не пустил → 401 / 403', failTone: 'danger' },
  { role: 'host', does: 'по методу и адресу находит метод', code: '@Controller · @Post', fail: 'нет адреса → 404', failTone: 'danger' },
  { role: 'waiter', does: 'берёт userId и тело, выписывает чек', code: 'new CreateItemCommand', fail: 'не готовит — это повар', failTone: 'logic' },
];

const CARD_W = 330;
const CARD_STEP = 380;
const CARD_H = 440;
const KITCHEN = { left: 1140, width: 300 };

export function HallEndSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="outro" title="Итог: что происходит в зале">
      {CARDS.map((c, i) => {
        const r = ROLES[c.role];
        const t = TONE[r.tone];
        return (
          <Reveal key={c.role} show={step >= i} from="up" className="absolute" style={{ left: i * CARD_STEP, top: 0, width: CARD_W, height: CARD_H }}>
            <div
              className={cn(
                'card flex h-full flex-col gap-5 border-t-[6px] p-7 transition-shadow duration-300',
                t.border,
                step === i && t.ring,
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                  <r.icon size={30} />
                </div>
                <div>
                  <div className="text-[30px] font-bold leading-tight">{r.name}</div>
                  <div className={cn('font-mono text-[19px] font-semibold', t.text)}>{r.tech}</div>
                </div>
              </div>
              <p className="text-[26px] font-semibold leading-snug">{c.does}</p>
              <div className="mt-auto">
                <div className="text-[16px] font-semibold uppercase tracking-wider text-muted">в коде</div>
                <div className="mt-1 font-mono text-[19px] font-semibold">{c.code}</div>
              </div>
              <span
                className={cn(
                  'self-start rounded-xl border-2 px-3 py-1.5 text-[21px] font-semibold leading-snug',
                  TONE[c.failTone].soft,
                  TONE[c.failTone].borderSoft,
                  TONE[c.failTone].text,
                )}
              >
                {c.fail}
              </span>
            </div>
          </Reveal>
        );
      })}

      {[0, 1].map((i) => (
        <Arrow
          key={i}
          show={step > i}
          from={[i * CARD_STEP + CARD_W + 6, CARD_H / 2]}
          to={[(i + 1) * CARD_STEP - 8, CARD_H / 2]}
          tone={ROLES[CARDS[i + 1].role].tone}
          width={3}
        />
      ))}
      <Arrow
        show={step >= 3}
        from={[2 * CARD_STEP + CARD_W + 6, CARD_H / 2]}
        to={[KITCHEN.left - 8, CARD_H / 2]}
        tone="logic"
        flow={step === 3}
        width={3}
      />

      {/* Кухня — следующая лекция */}
      <Reveal show={step >= 3} from="left" className="absolute" style={{ left: KITCHEN.left, top: 0, width: KITCHEN.width, height: CARD_H }}>
        <div className="flex h-full flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-logic/50 bg-logic/5 px-6 text-center">
          <ChefHat size={56} className="text-logic" />
          <div className="text-[32px] font-bold">Кухня</div>
          <Chip tone="logic" icon={ReceiptText}>
            CreateItemCommand
          </Chip>
          <div className="text-[22px] leading-snug text-text-2">шина, повар, сервисы — в следующий раз</div>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 3 ? 'logic' : ROLES[CARDS[Math.min(step, 2)].role].tone}
        captions={[
          'Охранник: нет пропуска или не та роль — дальше входа не пустит',
          'Хостес: таблицу маршрутов Nest собрал из наклеек при старте',
          'Официант тонкий: принял, выписал чек, отдал. Не готовит',
          'Чек ушёл на кухню. Что с ним там происходит — в следующий раз',
        ]}
      />
    </SlideLayout>
  );
}
