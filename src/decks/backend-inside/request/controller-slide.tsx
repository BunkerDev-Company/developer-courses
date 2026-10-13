'use client';

import { Braces, Brain, Bus, Database, KeyRound, Package, X } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { REQ } from './data';

/**
 * Шаги:
 * 0 — @CurrentUserId() userId ← request.userId (положил JwtAuthGuard)
 * 1 — @Body() dto ← тело JSON
 * 2 — new CreateItemCommand(userId, dto) → «коробка»-команда
 * 3 — commandBus.execute(...) → в шину; вывод: ни Prisma, ни логики
 */

// Метод create из items.controller.ts (переносы — как сделал бы prettier).
const CTRL_CODE = `@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
create(
  @CurrentUserId() userId: string,
  @Body() dto: CreateItemDto,
) {
  return this.commandBus.execute(
    new CreateItemCommand(userId, dto),
  );
}`;

// Геометрия кода: size md (22px, строка 22 × 1.55).
const CODE = { left: 430, top: 20, width: 580 };
const LH = 22 * 1.55;
const lineY = (n: number) => CODE.top + 45 + 16 + (n - 1) * LH + LH / 2;

const HL: number[][] = [[5], [6], [9], [8, 9, 10]];

function Card({
  tone,
  icon: Icon,
  title,
  active,
  children,
}: {
  tone: Tone;
  icon: typeof Package;
  title: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div className={cn('card px-5 py-4 transition-[border-color,box-shadow] duration-300', active && cn(t.border, t.ring))}>
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
          <Icon size={24} />
        </div>
        <div className="text-[22px] font-semibold leading-tight">{title}</div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function ControllerSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="request" title="Контроллер: принял → упаковал → отдал">
      {/* Слева — что приходит */}
      <Reveal show className="absolute" style={{ left: 0, top: 20, width: 370 }}>
        <Card tone="guard" icon={KeyRound} title={<M>request.userId</M>} active={step === 0}>
          <div className="font-mono text-[21px] font-semibold text-guard">&apos;{REQ.userId}&apos;</div>
          <div className="mt-1 text-[18px] text-text-2">положил JwtAuthGuard</div>
        </Card>
      </Reveal>
      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: 0, top: 198, width: 370 }}>
        <Card tone="client" icon={Braces} title="тело запроса (JSON)" active={step === 1}>
          <div className="whitespace-pre font-mono text-[20px] font-semibold leading-snug">
            {`{ "title": "${REQ.body.title}",\n  "price": ${REQ.body.price} }`}
          </div>
          <div className="mt-1 text-[18px] text-text-2">
            → <M>dto: CreateItemDto</M>
          </div>
        </Card>
      </Reveal>

      <Arrow from={[374, 92]} to={[CODE.left - 8, lineY(5)]} curve={-20} tone={step === 0 ? 'guard' : 'muted'} flow={step === 0} width={3} />
      <Arrow show={step >= 1} from={[374, 282]} to={[CODE.left - 8, lineY(6)]} curve={20} tone={step === 1 ? 'client' : 'muted'} flow={step === 1} width={3} />

      {/* Центр — реальный метод контроллера */}
      <Code
        code={CTRL_CODE}
        lang="ts"
        size="md"
        title="controllers/items.controller.ts"
        hl={HL[step] ?? HL[0]}
        tone={step === 0 ? 'guard' : step === 1 ? 'client' : 'logic'}
        className="absolute"
        style={{ left: CODE.left, top: CODE.top, width: CODE.width }}
      />

      {/* Справа — что уходит: коробка-команда → шина */}
      <Reveal show={step >= 2} from="scale" className="absolute" style={{ left: 1070, top: 236, width: 370 }}>
        <Card tone="logic" icon={Package} title={<M>CreateItemCommand</M>} active={step === 2}>
          <div className="whitespace-pre font-mono text-[19px] leading-snug">
            {`creatorUserId: '${REQ.userId}'\ndata: { title: '${REQ.body.title}',\n        price: ${REQ.body.price} }`}
          </div>
        </Card>
      </Reveal>
      <Arrow show={step >= 2} from={[CODE.left + CODE.width + 6, lineY(9)]} to={[1064, 330]} curve={-20} tone={step === 2 ? 'logic' : 'muted'} flow={step === 2} width={3} />

      <Reveal show={step >= 3} from="up" className="absolute" style={{ left: 1070, top: 470, width: 370 }}>
        <NodeBox tone="logic" icon={Bus} title="CommandBus" sub="найдёт хендлер" size="sm" state={step === 3 ? 'active' : 'idle'} />
      </Reveal>
      <Arrow show={step >= 3} from={[1255, 418]} to={[1255, 464]} tone="logic" flow={step === 3} width={3} />

      {/* Вывод: чего в контроллере нет */}
      <Reveal show={step >= 3} from="up" delay={0.3} className="absolute" style={{ left: 0, top: 402, width: 370 }}>
        <div className="card border-danger/40 px-5 py-3">
          <div className="text-[18px] font-semibold uppercase tracking-wider text-muted">в контроллере нет</div>
          <div className="mt-2 flex flex-col gap-1.5 text-[22px] font-semibold">
            <span className="flex items-center gap-3">
              <X size={22} strokeWidth={3} className="text-danger" />
              <Database size={22} className="text-prisma" /> Prisma
            </span>
            <span className="flex items-center gap-3">
              <X size={22} strokeWidth={3} className="text-danger" />
              <Brain size={22} className="text-logic" /> логики и проверок
            </span>
          </div>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 0 ? 'guard' : step === 1 ? 'client' : 'logic'}
        captions={[
          <>
            <M>@CurrentUserId()</M> берёт userId, который guard положил в request
          </>,
          <>
            <M>@Body()</M> — тело запроса, Nest кладёт его в <M>dto</M>
          </>,
          <>Из userId и dto собирается команда — «коробка» с данными</>,
          <>Команда уходит в шину. Ни Prisma, ни логики в контроллере</>,
        ]}
      />
    </SlideLayout>
  );
}
