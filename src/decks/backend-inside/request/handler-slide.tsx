'use client';

import { ArrowRight, Bell, CircleCheck, CircleX, Database } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { range } from '@/lib/motion';
import { TOKEN_CLASS } from '@/lib/highlight';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { DB_FIELDS } from './b-data';
import { DARK_TEXT, DataLine, DataPanel, ROW_H, panelH } from './b-panel';
import { REQ } from './data';

/**
 * Шаги:
 * 0 — command из шины + validate
 * 1 — prisma.item.create: camelCase команды → snake_case колонок
 * 2 — база вернула строку целиком
 * 3 — побочный эффект: notifications.send
 * 4 — return presentItem(item)
 */

const CODE = `async execute(command: CreateItemCommand) {
  const { data } = command;
  validate(this.errors, data, true);
  const item = await this.prisma.item.create({
    data: {
      title: data.title.trim(),
      description: data.description ?? null,
      price: Number(data.price),
      image_url: data.imageUrl ?? null,
      is_active: data.isActive ?? true,
      created_by: command.creatorUserId,
    },
  });
  await this.notifications.send({ … });
  return presentItem(item);
}`;

const HL: { lines: number[]; tone: Tone }[] = [
  { lines: [2, 3], tone: 'logic' },
  { lines: range(4, 13), tone: 'prisma' },
  { lines: [4], tone: 'db' },
  { lines: [14], tone: 'logic' },
  { lines: [15], tone: 'success' },
];

const PANEL_LEFT = 640;
const PANEL_W = 800;

const TITLE = JSON.stringify(REQ.body.title);
const USER = `"${REQ.userId}"`;

/** Откуда берётся каждое поле для INSERT. renamed — имя в базе другое. */
const MAPPING: { from: string; to: string; value: string; renamed?: boolean }[] = [
  { from: 'data.title', to: 'title', value: TITLE },
  { from: 'data.description', to: 'description', value: 'null' },
  { from: 'data.price', to: 'price', value: String(REQ.body.price) },
  { from: 'data.imageUrl', to: 'image_url', value: 'null', renamed: true },
  { from: 'data.isActive', to: 'is_active', value: 'true', renamed: true },
  { from: 'command.creatorUserId', to: 'created_by', value: USER, renamed: true },
];

/** Что в строке из базы появилось «само» — на шаге 2. */
const FROM_DB: Record<string, string> = {
  id: 'сгенерировала база',
  price: 'Decimal, не number',
  date_create_at: 'DEFAULT в базе',
  date_update_at: 'DEFAULT в базе',
};

export function HandlerSlide({ step }: SlideProps) {
  const hl = HL[step] ?? HL[HL.length - 1];
  const panel = step === 0 ? 'cmd' : step === 1 ? 'map' : 'row';

  return (
    <SlideLayout section="request" title="Handler: вся логика здесь">
      <Code
        code={CODE}
        lang="ts"
        size="sm"
        title="item-commands.handler.ts"
        hl={hl.lines}
        tone={hl.tone}
        className="absolute"
        style={{ left: 0, top: 0, width: 610 }}
      />

      <div className="absolute" style={{ left: PANEL_LEFT, top: 0, width: PANEL_W }}>
        <Swap k={panel}>
          {panel === 'cmd' && <CommandPanel />}
          {panel === 'map' && <MappingPanel />}
          {panel === 'row' && <RowPanel step={step} />}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={hl.tone}
        captions={[
          'Сначала проверка: пустой title → ошибка VALIDATION, дальше не идём',
          <>
            Собираем строку для базы: <M>imageUrl</M> → <M>image_url</M>, <M>created_by</M> — из команды
          </>,
          'База вернула строку целиком: id, Decimal, даты поставила она',
          'Побочный эффект: уведомление «Новый товар» — ответ не меняет',
          <>
            Наружу — не строка БД, а <M>presentItem(item)</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}

/* ── Шаг 0: команда и проверки ─────────────────────────────────── */

function CommandPanel() {
  return (
    <>
      <DataPanel title="command — пришла из шины" tone="logic">
        <DataLine k="creatorUserId" v={USER} />
        <DataLine text="data: {" />
        <DataLine k="title" v={`${TITLE},`} indent={2} state="hl" tone="logic" />
        <DataLine k="price" v={String(REQ.body.price)} indent={2} state="hl" tone="logic" />
        <DataLine text="}" />
      </DataPanel>

      <div className="card mt-6 px-6 py-4">
        <div className="mb-2 font-mono text-[19px] font-semibold text-logic">validate(this.errors, data, true)</div>
        <Check ok>
          <M>title</M> — строка, не пустая, ≤ 255 символов
        </Check>
        <Check ok>
          <M>price</M> — число ≥ 0
        </Check>
        <Check>
          иначе <M>errors.throw(&apos;VALIDATION&apos;, …)</M> → 400
        </Check>
      </div>
    </>
  );
}

function Check({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <div className="flex items-center gap-3 py-1.5 text-[24px]">
      <Icon size={28} className={cn('shrink-0', ok ? 'text-success' : 'text-danger')} />
      <span className={ok ? '' : 'text-text-2'}>{children}</span>
    </div>
  );
}

/* ── Шаг 1: объект data для Prisma ─────────────────────────────── */

function MappingPanel() {
  return (
    <>
      <DataPanel title="data для prisma.item.create()" tone="prisma">
        <div
          className="grid items-center px-6 text-[15px] font-semibold uppercase tracking-wider text-code-comment"
          style={{ gridTemplateColumns: '290px 48px 1fr', height: 34 }}
        >
          <span>из команды · camelCase</span>
          <span />
          <span>в базу · snake_case</span>
        </div>
        {MAPPING.map((m) => (
          <div
            key={m.to}
            className={cn('relative grid items-center px-6 font-mono text-[19px]', m.renamed && 'bg-code-line/[0.09]')}
            style={{ gridTemplateColumns: '290px 48px 1fr', height: ROW_H }}
          >
            {m.renamed && <span className="absolute inset-y-0 left-0 w-1.5 bg-prisma" />}
            <span className="text-code-text/70">{m.from}</span>
            <ArrowRight size={22} className={m.renamed ? DARK_TEXT.prisma : 'text-code-comment'} />
            <span className="whitespace-nowrap">
              <span className={m.renamed ? cn('font-semibold', DARK_TEXT.prisma) : TOKEN_CLASS.prop}>{m.to}</span>
              <span className="text-code-text">: </span>
              <span className={valueClass(m.value)}>{m.value}</span>
            </span>
          </div>
        ))}
      </DataPanel>

      <div className="mt-6 flex items-center gap-4">
        <Database size={30} className="shrink-0 text-db" />
        <span className="text-[22px] text-text-2">Prisma отправит в PostgreSQL:</span>
      </div>
      <div className="mt-3">
        <Chip tone="db">INSERT INTO &quot;Item&quot; (…) VALUES (…) RETURNING …</Chip>
      </div>
    </>
  );
}

function valueClass(v: string) {
  if (v.startsWith('"')) return TOKEN_CLASS.string;
  if (v === 'null' || v === 'true' || v === 'false') return TOKEN_CLASS.keyword;
  return TOKEN_CLASS.number;
}

/* ── Шаги 2–4: строка из базы ──────────────────────────────────── */

function RowPanel({ step }: { step: number }) {
  return (
    <>
      <DataPanel title="item — строка, которую вернула база" tone="db">
        {DB_FIELDS.map((f, i) => {
          const fromDb = step === 2 && f.key in FROM_DB;
          const usedInNotify = step === 3 && f.key === 'title';
          return (
            <DataLine
              key={f.key}
              k={f.key}
              v={i < DB_FIELDS.length - 1 ? `${f.value},` : f.value}
              state={fromDb || usedInNotify ? 'hl' : step === 3 ? 'dim' : 'normal'}
              tone={usedInNotify ? 'logic' : 'db'}
              note={fromDb ? FROM_DB[f.key] : usedInNotify ? '→ в уведомление' : undefined}
              noteTone={usedInNotify ? 'logic' : 'db'}
            />
          );
        })}
      </DataPanel>

      <div className="mt-5" style={{ height: 556 - panelH(DB_FIELDS.length) - 20 }}>
        <Swap k={step}>
          {step === 3 && (
            <div className="card flex items-center gap-5 px-6 py-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-text-2">
                <Bell size={30} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[24px] font-bold leading-tight">Новый товар</div>
                <div className="text-[22px] text-text-2">{REQ.body.title}</div>
              </div>
              <Chip size="sm">NotificationService · fake</Chip>
            </div>
          )}
          {step === 4 && (
            <div className={cn('card px-6 py-4', TONE.success.border)}>
              <div className="flex items-center gap-3 text-[24px]">
                <span className="font-mono font-semibold text-success">presentItem(item)</span>
                <ArrowRight size={26} className="text-success" />
                <span className="font-semibold">ответ API — следующий слайд</span>
              </div>
              <div className="mt-3 flex gap-3">
                <Chip tone="success">image_url → imageUrl</Chip>
                <Chip tone="success">Decimal → number</Chip>
                <Chip tone="danger">created_by ✕</Chip>
              </div>
            </div>
          )}
        </Swap>
      </div>
    </>
  );
}
