'use client';

import { motion } from 'framer-motion';
import { ChefHat, MessageCircleQuestion, ReceiptText, X } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Reveal, Swap } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { REQ } from '../backend-inside/request/data';
import { RoleBadge } from '../request/restaurant';

/**
 * Шаги:
 * 0 — чек официанта ↔ класс CreateItemCommand: «кто» и «что»
 * 1 — в чеке нет рецепта: у команды только поля, готовит повар
 * 2 — имена команд и запросов = меню бэкенда: заказы меняют, вопросы читают
 */

const CMD_CODE = `export class CreateItemCommand {
  constructor(
    public readonly creatorUserId: string,
    public readonly data: CreateItemInput,
  ) {}
}`;

const NEW_CODE = `new CreateItemCommand('${REQ.userId}', { title: '${REQ.body.title}', price: ${REQ.body.price} })`;

const TICKET = { left: 0, top: 0, width: 420, height: 330 };
const ROW_Y = { who: 118, what: 194 };
const CODE = { left: 520, top: 0, width: 920 };
const LH = 19 * 1.55;
const lineY = (n: number) => CODE.top + 45 + 16 + (n - 0.5) * LH;
const LOWER = 392;

const COMMANDS = ['CreateItemCommand', 'UpdateItemCommand', 'DeleteItemCommand', 'LoginCommand', 'UploadImageCommand'];
const QUERIES = ['ListItemsQuery', 'GetItemQuery', 'GetMeQuery'];

export function TicketSlide({ step }: SlideProps) {
  const menu = step === 2;

  return (
    <SlideLayout section="request" title="Команда — это чек" aside={<RoleBadge role="ticket" />}>
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: menu ? 0.35 : 1 }} transition={{ duration: 0.4 }}>
        <Ticket step={step} />

        <Arrow from={[TICKET.width + 6, ROW_Y.who]} to={[CODE.left - 8, lineY(3)]} tone="logic" width={3} delay={0.3} />
        <Arrow from={[TICKET.width + 6, ROW_Y.what]} to={[CODE.left - 8, lineY(4)]} tone="logic" width={3} delay={0.45} />

        <Code
          code={CMD_CODE}
          lang="ts"
          size="sm"
          title="application/commands/item.commands.ts"
          hl={step === 1 ? [2, 3, 4, 5] : [3, 4]}
          tone="logic"
          className="absolute"
          style={CODE}
        />
        <div className="absolute" style={{ left: CODE.left, top: 274, width: CODE.width }}>
          <Code code={NEW_CODE} lang="ts" size="sm" title="так его выписывает официант (контроллер)" />
        </div>
      </motion.div>

      <div className="absolute" style={{ left: 0, top: LOWER, width: 1440 }}>
        <Swap k={step}>
          {step === 1 && <NoRecipe />}
          {step === 2 && <Menu />}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone="logic"
        captions={[
          'Чек — это кто заказал и что. Команда — то же самое, только классом',
          'В чеке нет рецепта: у команды только поля. Как готовить — знает повар',
          <>
            Имена чеков — меню бэкенда: заказы <b>меняют</b>, вопросы <b>читают</b>
          </>,
        ]}
      />
    </SlideLayout>
  );
}

function Ticket({ step }: { step: number }) {
  return (
    <div
      className="card absolute overflow-hidden border-logic/50"
      style={{ left: TICKET.left, top: TICKET.top, width: TICKET.width, height: TICKET.height }}
    >
      <div className="flex items-center gap-3 px-7" style={{ height: 72 }}>
        <ReceiptText size={32} className="text-logic" />
        <span className="text-[30px] font-bold">Чек</span>
        <span className="ml-auto font-mono text-[18px] text-muted">№ 1042</span>
      </div>
      <div className="mx-6 border-t-2 border-dashed border-border-2" />
      {[
        { label: 'кто', value: 'Стол 5', y: ROW_Y.who },
        { label: 'что', value: 'Карбонара × 1', y: ROW_Y.what },
      ].map((r) => (
        <div key={r.label} className="absolute flex items-baseline gap-5 px-7" style={{ top: r.y - 22, left: 0 }}>
          <span className="w-12 text-[18px] font-semibold uppercase tracking-wider text-muted">{r.label}</span>
          <span className="text-[30px] font-bold">{r.value}</span>
        </div>
      ))}
      <div className="absolute inset-x-6 border-t-2 border-dashed border-border-2" style={{ top: 244 }} />
      <motion.div
        className="absolute flex items-center gap-3 px-7 text-[24px] font-semibold text-danger"
        style={{ top: 264 }}
        initial={false}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <X size={26} strokeWidth={3} />
        <span className="line-through decoration-2">как варить пасту</span>
      </motion.div>
    </div>
  );
}

function NoRecipe() {
  return (
    <div className="flex items-stretch gap-8">
      <div className="card flex-1 px-7 py-5">
        <div className="text-[17px] font-semibold uppercase tracking-wider text-muted">в команде нет</div>
        <div className="mt-3 flex gap-8 text-[26px] font-semibold">
          {['проверок', 'Prisma', 'методов'].map((w) => (
            <span key={w} className="flex items-center gap-2.5">
              <X size={24} strokeWidth={3} className="text-danger" /> {w}
            </span>
          ))}
        </div>
      </div>
      <Reveal show delay={0.2} from="left" className="flex-1">
        <div className={cn('card flex h-full items-center gap-5 px-7 py-5', TONE.logic.border)}>
          <ChefHat size={44} className="shrink-0 text-logic" />
          <div>
            <div className="text-[26px] font-bold">Как готовить — знает повар</div>
            <div className="font-mono text-[20px] font-semibold text-logic">CreateItemHandler</div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function Menu() {
  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: '1.55fr 1fr' }}>
      <MenuColumn icon={ReceiptText} title="Заказы — меняют" bus="CommandBus" names={COMMANDS} />
      <MenuColumn icon={MessageCircleQuestion} title="Вопросы — читают" bus="QueryBus" names={QUERIES} />
    </div>
  );
}

function MenuColumn({ icon: Icon, title, bus, names }: { icon: typeof ReceiptText; title: string; bus: string; names: string[] }) {
  return (
    <div className={cn('card px-6 py-3', TONE.logic.borderSoft)}>
      <div className="flex items-center gap-3">
        <Icon size={28} className="text-logic" />
        <span className="text-[26px] font-bold">{title}</span>
        <Chip tone="logic" size="sm" className="ml-auto">
          {bus}
        </Chip>
      </div>
      <div className="mt-2 flex flex-wrap gap-2.5">
        {names.map((n) => (
          <Chip key={n} tone="logic" className="text-[19px]">
            {n}
          </Chip>
        ))}
      </div>
    </div>
  );
}
