'use client';

import { motion } from 'framer-motion';
import { CircleCheck, GitPullRequest } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE } from '../it-company/data';
import { ChatLine } from '../it-company/parts';
import { Pill } from '../what-is-backend/parts';

/**
 * Ревью PR с проверкой цены (код — из etalon-backend, item-commands.handler.ts).
 * 0 diff → 1 бесполезный комментарий → 2 полезный: факт, последствие, предложение →
 * 3 автор поправил → 4 одобрено.
 */

const BEFORE = `if (isCreate || data.price !== undefined) {
  const price = Number(data.price);
  if (price < 0)
    errors.throw('VALIDATION', 'Цена должна быть числом >= 0');
}`;

const AFTER = `if (isCreate || data.price !== undefined) {
  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0)
    errors.throw('VALIDATION', 'Цена должна быть числом >= 0');
}`;

const LEFT_W = 800;
const RIGHT_X = 830;
const RIGHT_W = 610;

export function ReviewSlide({ step }: SlideProps) {
  const fixed = step >= 3;
  return (
    <SlideLayout section="code" title="Код-ревью">
      <div className="absolute flex items-center gap-3" style={{ left: 0, top: 0, width: LEFT_W, height: 48 }}>
        <GitPullRequest size={28} className="shrink-0 text-git" />
        <span className="text-[24px] font-bold">PR #52</span>
        <span className="truncate text-[22px] text-text-2">SHOP-40: цена товара не может быть отрицательной</span>
      </div>

      <div className="absolute" style={{ left: 0, top: 64, width: LEFT_W }}>
        <Swap k={fixed ? 'after' : 'before'}>
          <Code
            code={fixed ? AFTER : BEFORE}
            lang="ts"
            size="sm"
            title="src/application/handlers/item-commands.handler.ts"
            hl={step >= 1 ? [3] : undefined}
            tone={fixed ? 'success' : 'danger'}
            lineNumbers
          />
        </Swap>
      </div>

      <Reveal show={step >= 2} from="up" className="absolute" style={{ left: 0, top: 340, width: LEFT_W }}>
        <div className="card flex flex-col gap-2 px-6 py-4 text-[21px] leading-snug">
          <div>
            <M>Number(&quot;abc&quot;)</M> → <M>NaN</M>
          </div>
          <div>
            <M>NaN &lt; 0</M> → <M>false</M> — проверка пропускает мусор
          </div>
        </div>
      </Reveal>

      {/* Обсуждение */}
      <div className="absolute flex flex-col gap-3" style={{ left: RIGHT_X, top: 0, width: RIGHT_W }}>
        <Reveal show={step >= 1} from="left">
          <motion.div
            className="card px-5 py-4"
            initial={false}
            animate={{ opacity: step >= 2 ? 0.45 : 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <ChatLine who={PEOPLE.front.name} role={PEOPLE.front.role} time="11:02">
              Проверка так себе, переделай.
            </ChatLine>
            <div className="mt-2 pl-[58px]">
              <Pill tone="danger" className="text-[18px]">
                непонятно, что не так
              </Pill>
            </div>
          </motion.div>
        </Reveal>

        <Reveal show={step >= 2} from="left">
          <div className={cn('card px-5 py-4', step === 2 && 'border-success')}>
            <ChatLine who={PEOPLE.lead.name} role={PEOPLE.lead.role} time="11:20">
              Если цена придёт строкой «abc», <M>Number()</M> вернёт <M>NaN</M>, и проверка её пропустит. Добавим{' '}
              <M>Number.isFinite</M>?
            </ChatLine>
            <div className="mt-2 flex gap-2 pl-[58px]">
              <Pill tone="success" className="text-[18px]">
                факт
              </Pill>
              <Pill tone="success" className="text-[18px]">
                последствие
              </Pill>
              <Pill tone="success" className="text-[18px]">
                предложение
              </Pill>
            </div>
          </div>
        </Reveal>

        <Reveal show={step >= 3} from="left">
          <div className="card px-5 py-4">
            <ChatLine who={PEOPLE.you.name} role={PEOPLE.you.role} time="11:34">
              Поправил, спасибо! Коммит <M>7c1e0b4</M>
            </ChatLine>
          </div>
        </Reveal>

        <Reveal show={step >= 4} from="scale">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-success bg-success/10 px-5 py-3 text-[22px] font-semibold">
            <CircleCheck size={28} className="text-success" />
            Анна одобрила изменения
            <span className="ml-auto">
              <Pill tone="success" solid>
                Approved
              </Pill>
            </span>
          </div>
        </Reveal>
      </div>

      <StepCaption
        step={step}
        tone={step === 1 ? 'danger' : step >= 2 ? 'success' : 'git'}
        captions={[
          'Pull request: изменения видны построчно',
          '«Так себе» — обидно и непонятно, что делать',
          'Хороший комментарий: факт → последствие → предложение',
          'Автор поправил и ответил — обсуждение закрыто',
          'Одобрено. Ревью — про код, а не про человека',
        ]}
      />
    </SlideLayout>
  );
}
