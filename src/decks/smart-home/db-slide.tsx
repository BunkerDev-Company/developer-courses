'use client';

import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Reveal } from '@/components/ui/reveal';
import { SchemaCard, type SchemaColumn } from '@/components/ui/schema-card';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { T } from './data';

/**
 * Шаги:
 * 0 — Home + HomeMember: чей дом и кто в нём (на этом стоит изоляция домов)
 * 1 — Device: desired / reported, online, last_seen_at
 * 2 — Reading: история показаний — строк очень много
 * 3 — индекс под «график за сутки»
 * Схема — пример в стиле etalon (таблицы "PascalCase", колонки snake_case, date_create_at).
 */

const GAP = 24;
const CARD_W = (1440 - GAP * 3) / 4;

const HOME: SchemaColumn[] = [
  { name: 'id', type: 'uuid', pk: true },
  { name: 'name', type: 'varchar' },
  { name: 'timezone', type: 'varchar' },
];
const MEMBER: SchemaColumn[] = [
  { name: 'home_id', type: 'uuid', pk: true },
  { name: 'user_id', type: 'uuid', pk: true },
  { name: 'role', type: 'varchar' },
];

function deviceCols(step: number): SchemaColumn[] {
  const hl = step === 1 ? 'hl' : 'normal';
  return [
    { name: 'id', type: 'varchar', pk: true },
    { name: 'home_id', type: 'uuid' },
    { name: 'kind', type: 'varchar' },
    { name: 'desired', type: 'jsonb', state: hl },
    { name: 'reported', type: 'jsonb', state: hl },
    { name: 'online', type: 'boolean', state: hl },
    { name: 'last_seen_at', type: 'timestamptz', state: hl },
  ];
}

const READING: SchemaColumn[] = [
  { name: 'id', type: 'bigserial', pk: true },
  { name: 'device_id', type: 'varchar' },
  { name: 'temperature', type: 'numeric' },
  { name: 'date_create_at', type: 'timestamptz' },
];

const INDEX_SQL = `CREATE INDEX idx_reading_device_time ON "Reading" (device_id, date_create_at DESC);`;

export function DbSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="backend" title="Что хранить в базе">
      <SchemaCard name="Home" columns={HOME} tone={T.db} state={step === 0 ? 'hl' : 'normal'} className="absolute" style={{ left: 0, top: 0, width: CARD_W }} />
      <SchemaCard name="HomeMember" columns={MEMBER} tone={T.db} state={step === 0 ? 'hl' : 'normal'} className="absolute" style={{ left: CARD_W + GAP, top: 0, width: CARD_W }} />
      <Reveal show={step >= 1} className="absolute" style={{ left: 2 * (CARD_W + GAP), top: 0, width: CARD_W }}>
        <SchemaCard name="Device" columns={deviceCols(step)} tone={T.device} state={step === 1 ? 'hl' : 'normal'} />
      </Reveal>
      <Reveal show={step >= 2} className="absolute" style={{ left: 3 * (CARD_W + GAP), top: 0, width: CARD_W }}>
        <SchemaCard name="Reading" columns={READING} tone={T.db} state={step === 2 ? 'hl' : 'normal'} />
      </Reveal>

      <Reveal show={step === 0} className="absolute" style={{ left: 0, top: 260, width: 2 * CARD_W + GAP }}>
        <div className="card px-6 py-4 text-[23px] leading-snug">Каждый запрос к устройству проходит через эти две таблицы — так чужой дом не виден</div>
      </Reveal>
      <Reveal show={step === 2 || step === 3} className="absolute" style={{ left: 3 * (CARD_W + GAP), top: 252 }}>
        <Chip tone="danger">8 640 строк в сутки</Chip>
      </Reveal>
      <Reveal show={step === 2 || step === 3} delay={0.1} className="absolute" style={{ left: 3 * (CARD_W + GAP), top: 302, width: CARD_W }}>
        <span className="text-[20px] leading-snug text-text-2">с одного чайника, если писать раз в 10 с</span>
      </Reveal>

      <Reveal show={step === 3} from="up" className="absolute" style={{ left: 0, top: 420, width: 1100 }}>
        <Code code={INDEX_SQL} lang="sql" size="sm" title="migrations/sqls/…_readings-up.sql" hl={[1]} tone={T.db} />
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 1 ? T.device : step === 2 ? 'danger' : T.db}
        captions={[
          'Чей дом и кто в нём живёт — на этом держится изоляция домов',
          'Устройство: что хотим, что есть, на связи ли и когда было видно',
          'История показаний — самая большая таблица',
          'Индекс под «график за сутки»: ищем по устройству и времени',
        ]}
      />
    </SlideLayout>
  );
}
