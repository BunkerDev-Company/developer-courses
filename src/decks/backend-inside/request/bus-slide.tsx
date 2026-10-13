'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Bus, Cog, Package, Search, X } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { Terminal, type TermLine } from '@/components/ui/terminal';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги:
 * 0 — команда входит в шину; реестр «команда → хендлер»; найдена строка → CreateItemHandler
 * 1 — откуда реестр: @CommandHandler(CreateItemCommand) + массив CommandHandlers в app.module.ts
 * 2 — забыли добавить в массив → сборка проходит, а запрос падает: No handler found…
 * 3 — команды меняют (CommandBus), запросы читают (QueryBus); у каждой ровно один хендлер
 */

type RowState = 'normal' | 'hl' | 'removed' | 'dim';

interface RegRow {
  key: string;
  handler: string;
  state: RowState;
}

const ROW_H = 40;
const HEAD_H = 58;
const rowCenter = (top: number, i: number) => top + HEAD_H + 6 + i * ROW_H + ROW_H / 2;

function Registry({
  title,
  icon: Icon,
  tone,
  rows,
  tag,
  error,
  style,
}: {
  title: string;
  icon: LucideIcon;
  tone: Tone;
  rows: RegRow[];
  tag?: React.ReactNode;
  error?: boolean;
  style: React.CSSProperties;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        'card absolute overflow-hidden transition-[border-color,box-shadow] duration-300',
        error ? 'border-danger shadow-[0_0_0_6px_rgb(var(--c-danger)/0.15)]' : cn(t.border, t.ring),
      )}
      style={style}
    >
      <div className={cn('flex items-center gap-3 border-b-2 border-border px-5', t.soft)} style={{ height: HEAD_H }}>
        <Icon size={26} className={t.text} />
        <span className="font-mono text-[24px] font-bold">{title}</span>
        {!tag && <span className="ml-1 text-[17px] font-semibold uppercase tracking-wider text-muted">реестр</span>}
        {tag && <span className="ml-auto">{tag}</span>}
      </div>
      <div className="py-1.5">
        {rows.map((r) => (
          <div
            key={r.key}
            className={cn(
              'relative grid items-center gap-3 px-5 font-mono text-[19px] transition-[background-color,opacity] duration-300',
              r.state === 'hl' && 'bg-logic/10 font-semibold',
              r.state === 'dim' && 'opacity-40',
              r.state === 'removed' && 'bg-danger/10 text-danger line-through decoration-2',
            )}
            style={{ gridTemplateColumns: '1fr 28px 1fr', height: ROW_H }}
          >
            {r.state === 'hl' && <span className={cn('absolute inset-y-0 left-0 w-1.5', t.bg)} />}
            {r.state === 'removed' && <span className="absolute inset-y-0 left-0 w-1.5 bg-danger" />}
            <span className="truncate">{r.key}</span>
            <ArrowRight size={20} className={r.state === 'removed' ? 'text-danger' : 'text-muted'} />
            <span className="truncate">{r.handler}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const COMMANDS: [string, string][] = [
  ['LoginCommand', 'LoginHandler'],
  ['CreateItemCommand', 'CreateItemHandler'],
  ['UpdateItemCommand', 'UpdateItemHandler'],
  ['DeleteItemCommand', 'DeleteItemHandler'],
  ['UploadImageCommand', 'UploadImageHandler'],
];

const QUERIES: [string, string][] = [
  ['GetMeQuery', 'GetMeHandler'],
  ['ListItemsQuery', 'ListItemsHandler'],
  ['GetItemQuery', 'GetItemHandler'],
];

const BUS_CODE = `const handler = this.handlers.get(CreateItemCommand);
if (!handler) throw new CommandHandlerNotFoundException(…);
return handler.execute(command);`;

const HANDLER_CODE = `@CommandHandler(CreateItemCommand)
export class CreateItemHandler
  implements ICommandHandler<CreateItemCommand> {
  async execute(command: CreateItemCommand) { … }
}`;

const ARRAY_OK = `const CommandHandlers = [
  LoginHandler, CreateItemHandler,
  UpdateItemHandler, DeleteItemHandler,
  UploadImageHandler,
];`;

const ARRAY_BAD = `const CommandHandlers = [
  LoginHandler, // ← а CreateItemHandler?
  UpdateItemHandler, DeleteItemHandler,
  UploadImageHandler,
];`;

const TERM: TermLine[] = [
  { text: 'npm run build && npm run start:dev', kind: 'cmd' },
  { text: 'Nest application successfully started', kind: 'ok' },
  { text: '# админ жмёт «Создать» → POST /api/v1/items', kind: 'dim' },
  { text: 'ERROR Unhandled exception at POST /api/v1/items', kind: 'err' },
  { text: 'No handler found for the command: "CreateItemCommand".', kind: 'err' },
  { text: '# клиенту ушло: 500, "code": 99', kind: 'dim' },
];

const BUS = { left: 310, top: 0, width: 600 };
const QBUS_TOP = 316;
const DETAIL_TOP = 304;

function Tag({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = TONE[tone];
  return <span className={cn('whitespace-nowrap rounded-lg border-2 px-2.5 py-1 text-[17px] font-semibold', t.borderSoft, t.text, 'bg-surface')}>{children}</span>;
}

function InBox({ name, from, top, show = true }: { name: string; from: string; top: number; show?: boolean }) {
  return (
    <Reveal show={show} from="right" className="absolute" style={{ left: 0, top, width: 262 }}>
      <div className="card border-logic/50 px-4 py-3">
        <div className="flex items-center gap-2 text-[16px] font-semibold text-muted">
          <Package size={20} className="text-logic" /> {from}
        </div>
        <div className="mt-1 font-mono text-[19px] font-semibold">{name}</div>
      </div>
    </Reveal>
  );
}

export function BusSlide({ step }: SlideProps) {
  const broken = step === 2;
  const cmdRows: RegRow[] = COMMANDS.map(([c, h]) => ({
    key: c,
    handler: h,
    state: c === 'CreateItemCommand' ? (broken ? 'removed' : 'hl') : step === 3 ? 'dim' : 'normal',
  }));
  const qRows: RegRow[] = QUERIES.map(([q, h]) => ({ key: q, handler: h, state: q === 'GetItemQuery' ? 'hl' : 'dim' }));
  const createY = rowCenter(BUS.top, 1);
  const getItemY = rowCenter(QBUS_TOP, 2);

  return (
    <SlideLayout section="request" title={<><M>CommandBus</M>: кто обработает команду</>}>
      {/* Верх: команда → шина с реестром → хендлер */}
      <InBox name="CreateItemCommand" from="из контроллера" top={createY - 44} />
      <Arrow from={[266, createY]} to={[BUS.left - 6, createY]} tone="logic" flow={step === 0} width={3} />

      <Registry
        title="CommandBus"
        icon={Bus}
        tone="logic"
        rows={cmdRows}
        error={broken}
        tag={step === 3 ? <Tag tone="logic">меняют · POST PATCH DELETE</Tag> : undefined}
        style={{ left: BUS.left, top: BUS.top, width: BUS.width }}
      />

      <Arrow show={!broken} from={[BUS.left + BUS.width + 6, createY]} to={[984, createY]} tone="logic" flow={step === 0} delay={0.4} width={3} />
      <AnimatePresence>
        {broken && (
          <motion.div
            key="x"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: 0.3 }}
            className="absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-danger text-white shadow-card"
            style={{ left: 925, top: createY - 24 }}
          >
            <X size={28} strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
      <NodeBox
        tone="logic"
        icon={Cog}
        title="CreateItemHandler"
        sub={broken ? 'класс есть, но не зарегистрирован' : 'execute(command)'}
        size="sm"
        state={broken ? 'dim' : step === 3 ? 'idle' : 'active'}
        className="absolute"
        style={{ left: 990, top: createY - 40, width: 450 }}
      />

      {/* Шаг 0: шина внутри — просто словарь + вызов */}
      <Reveal show={step === 0} delay={0.5} className="absolute" style={{ left: 310, top: DETAIL_TOP, width: 820 }}>
        <Code
          code={BUS_CODE}
          lang="ts"
          size="sm"
          title={
            <span className="flex items-center gap-2">
              <Search size={16} /> внутри commandBus.execute() — упрощённо
            </span>
          }
          hl={[1, 3]}
          tone="logic"
        />
      </Reveal>

      {/* Шаги 1–2: откуда реестр */}
      <Reveal show={step === 1 || step === 2} className="absolute" style={{ left: 0, top: DETAIL_TOP, width: 540 }}>
        <Code
          code={broken ? ARRAY_BAD : ARRAY_OK}
          lang="ts"
          size="sm"
          title="app.module.ts — кого создать"
          hl={[2]}
          tone={broken ? 'danger' : 'logic'}
        />
      </Reveal>
      <Reveal show={step === 1} delay={0.15} className="absolute" style={{ left: 580, top: DETAIL_TOP, width: 860 }}>
        <Code code={HANDLER_CODE} lang="ts" size="sm" title="item-commands.handler.ts — на какую команду" hl={[1]} tone="logic" />
      </Reveal>
      <Reveal show={step === 2} delay={0.15} className="absolute" style={{ left: 580, top: DETAIL_TOP, width: 860 }}>
        <Terminal lines={broken ? TERM : []} title="npm run start:dev" style={{ height: 246 }} />
      </Reveal>

      {/* Шаг 3: запросы — своя шина */}
      <InBox name="GetItemQuery" from="GET /items/:id" top={getItemY - 44} show={step === 3} />
      <Arrow show={step === 3} from={[266, getItemY]} to={[BUS.left - 6, getItemY]} tone="logic" width={3} delay={0.3} />
      <Reveal show={step === 3} className="absolute" style={{ left: 0, top: 0, width: 0 }}>
        <Registry
          title="QueryBus"
          icon={Bus}
          tone="logic"
          rows={qRows}
          tag={<Tag tone="logic">читают · GET</Tag>}
          style={{ left: BUS.left, top: QBUS_TOP, width: BUS.width }}
        />
      </Reveal>
      <Arrow show={step === 3} from={[BUS.left + BUS.width + 6, getItemY]} to={[984, getItemY]} tone="logic" width={3} delay={0.5} />
      <Reveal show={step === 3} delay={0.5} from="left" className="absolute" style={{ left: 990, top: getItemY - 40, width: 450 }}>
        <NodeBox tone="logic" icon={Cog} title="GetItemHandler" sub="execute(query)" size="sm" state="active" />
      </Reveal>

      <StepCaption
        step={step}
        tone={broken ? 'danger' : 'logic'}
        captions={[
          <>
            Шина смотрит в реестр: для <M>CreateItemCommand</M> — один хендлер
          </>,
          <>
            Реестр собирается при старте: <M>@CommandHandler</M> + массив в app.module
          </>,
          <>Забыли в массиве — сборка проходит, а запрос падает с 500</>,
          <>Команды меняют, запросы читают. У каждой — ровно один хендлер</>,
        ]}
      />
    </SlideLayout>
  );
}
