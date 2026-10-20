'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Footprints, PencilOff, Puzzle } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { RoleBadge } from '../request/restaurant';

/**
 * Шаги:
 * 0 — без шины: контроллер получает каждого повара в конструктор и зовёт его по имени
 * 1 — с шиной (как в etalon): контроллер знает только шину
 * 2 — что выиграли и чем платим (регистрация — следующий слайд)
 */

// Так тоже работает: хендлеры — обычные провайдеры, их можно внедрить напрямую.
const DIRECT_CODE = `constructor(
  private readonly createItem: CreateItemHandler,
  private readonly updateItem: UpdateItemHandler,
  private readonly deleteItem: DeleteItemHandler,
  private readonly listItems: ListItemsHandler,
  private readonly getItem: GetItemHandler,
) {}

create(…) {
  return this.createItem.execute(
    new CreateItemCommand(userId, dto),
  );
}`;

const BUS_CODE = `constructor(
  private readonly commandBus: CommandBus,
  private readonly queryBus: QueryBus,
) {}

create(…) {
  return this.commandBus.execute(
    new CreateItemCommand(userId, dto),
  );
}`;

const COL_W = 700;
const RIGHT_X = 1440 - COL_W;
const CODE_TOP = 64;

function Head({ icon: Icon, text, active }: { icon: typeof Footprints; text: string; active: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 text-[26px] font-bold transition-colors duration-300', active ? 'text-logic' : 'text-muted')}>
      <Icon size={30} />
      {text}
    </div>
  );
}

export function WhyBusSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="request" title="Зачем шина, а не прямой вызов" aside={<RoleBadge role="pass" />}>
      {/* Слева — без шины */}
      <motion.div
        className="absolute"
        style={{ left: 0, top: 0, width: COL_W }}
        initial={false}
        animate={{ opacity: step === 0 ? 1 : 0.4 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Head icon={Footprints} text="Без шины: официант бегает к поварам" active={step === 0} />
        <Code
          code={DIRECT_CODE}
          lang="ts"
          size="sm"
          title="items.controller.ts — так можно, но…"
          hl={[2, 3, 4, 5, 6, 10]}
          tone="danger"
          style={{ marginTop: CODE_TOP - 40 }}
        />
      </motion.div>

      {/* Справа — с шиной */}
      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: RIGHT_X, top: 0, width: COL_W }}>
        <Head icon={ClipboardList} text="С шиной: чек — на раздачу" active={step >= 1} />
        <Code
          code={BUS_CODE}
          lang="ts"
          size="sm"
          title="items.controller.ts — как в etalon"
          hl={[2, 3, 7]}
          tone="logic"
          style={{ marginTop: CODE_TOP - 40 }}
        />
      </Reveal>

      {/* Что выиграли */}
      <Reveal show={step >= 2} from="up" className="absolute" style={{ left: RIGHT_X, top: 450, width: COL_W }}>
        <div className="card flex flex-col gap-2 border-logic/50 px-6 py-3.5 text-[24px] font-semibold">
          <span className="flex items-center gap-3">
            <Puzzle size={26} className="shrink-0 text-logic" /> контроллер не знает поваров по именам
          </span>
          <span className="flex items-center gap-3">
            <PencilOff size={26} className="shrink-0 text-logic" /> переписали повара — официант тот же
          </span>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 0 ? 'danger' : 'logic'}
        captions={[
          'Без шины контроллер знает каждого повара по имени — и их всё больше',
          'С шиной — знает только раздачу: повесил чек, а кто готовит, решает кухня',
          'Цена: каждого повара надо записать на раздаче. Забыли — следующий слайд',
        ]}
      />
    </SlideLayout>
  );
}
