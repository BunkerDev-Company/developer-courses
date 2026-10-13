'use client';

import { ArrowRight } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { API_FIELDS, DB_FIELDS, valueOf } from './b-data';
import { DataLine, DataPanel, panelH, rowY, type LineState } from './b-panel';

/**
 * Шаги:
 * 0 — id / title / description переезжают как есть
 * 1 — snake_case → camelCase (image_url, is_active, даты)
 * 2 — Decimal("1990.00") → 1990
 * 3 — created_by наружу не уходит; password_hash у User — никогда; один presenter на ресурс
 */

/** Колонка БД → поле API и шаг, на котором её разбираем. */
const MAP: { db: string; api: string | null; step: number; label?: string }[] = [
  { db: 'id', api: 'id', step: 0 },
  { db: 'title', api: 'title', step: 0 },
  { db: 'description', api: 'description', step: 0 },
  { db: 'price', api: 'price', step: 2, label: 'Number()' },
  { db: 'image_url', api: 'imageUrl', step: 1 },
  { db: 'is_active', api: 'isActive', step: 1, label: 'snake_case → camelCase' },
  { db: 'created_by', api: null, step: 3 },
  { db: 'date_create_at', api: 'createdAt', step: 1 },
  { db: 'date_update_at', api: 'updatedAt', step: 1 },
];

const LEFT_W = 540;
const RIGHT_LEFT = 900;
const BOTTOM = panelH(DB_FIELDS.length) + 28;

export function PresenterSlide({ step }: SlideProps) {
  const apiKeys = API_FIELDS.map((f) => f.key);

  return (
    <SlideLayout section="request" title="Presenter: строка БД → ответ API">
      {/* Слева — строка из базы */}
      <DataPanel title="item — строка из БД" tone="db" className="absolute" style={{ left: 0, top: 0, width: LEFT_W }}>
        {MAP.map((m, i) => {
          const current = m.step === step;
          const dropped = m.api === null && step >= 3;
          const state: LineState = dropped ? 'off' : current ? 'hl' : 'normal';
          return (
            <DataLine
              key={m.db}
              k={m.db}
              v={`${valueOf(DB_FIELDS, m.db)}${i < MAP.length - 1 ? ',' : ''}`}
              state={state}
              tone="accent"
              keyTone={current && m.step === 1 ? 'accent' : undefined}
              note={dropped ? '✕ не отдаём' : undefined}
              noteTone="danger"
            />
          );
        })}
      </DataPanel>

      {/* Справа — то, что вернул presentItem */}
      <DataPanel
        title="presentItem(item) — ответ API"
        tone="success"
        className="absolute"
        style={{ left: RIGHT_LEFT, top: 0, width: LEFT_W }}
      >
        {API_FIELDS.map((f, j) => {
          const m = MAP.find((x) => x.api === f.key)!;
          const state: LineState = m.step > step ? 'hidden' : m.step === step ? 'hl' : 'normal';
          return (
            <DataLine
              key={f.key}
              json
              k={f.key}
              v={`${f.value}${j < API_FIELDS.length - 1 ? ',' : ''}`}
              state={state}
              tone="success"
              keyTone={m.step === step && m.step === 1 ? 'accent' : undefined}
            />
          );
        })}
      </DataPanel>

      {/* Стрелки поле → поле */}
      {MAP.map((m, i) => {
        if (m.api === null) return null;
        const j = apiKeys.indexOf(m.api);
        const current = m.step === step;
        return (
          <Arrow
            key={m.db}
            show={step >= m.step}
            from={[LEFT_W + 6, rowY(i)]}
            to={[RIGHT_LEFT - 8, rowY(j)]}
            tone={current ? 'accent' : 'muted'}
            width={current ? 4 : 3}
            delay={current ? (i % 4) * 0.08 : 0}
            label={m.label}
          />
        );
      })}

      {/* Итог: password_hash и «один presenter на ресурс» */}
      <Reveal show={step >= 3} from="up" className="absolute" style={{ left: 0, top: BOTTOM, width: LEFT_W }}>
        <DataPanel title="User — строка из БД (GetMeHandler)" tone="db">
          <DataLine k="password_hash" v={'"$argon2id$…"'} state="off" note="✕ никогда" noteTone="danger" />
        </DataPanel>
      </Reveal>

      <Reveal
        show={step >= 3}
        from="up"
        delay={0.15}
        className="absolute"
        style={{ left: 580, top: BOTTOM, width: 860 }}
      >
        <div className="card px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Chip tone="ctrl">GET /items</Chip>
            <Chip tone="ctrl">GET /items/:id</Chip>
            <Chip tone="ctrl">POST /items</Chip>
            <ArrowRight size={28} className="mx-1 shrink-0 text-success" />
            <Chip tone="success" solid>
              presentItem
            </Chip>
          </div>
          <div className="mt-2.5 text-[24px] font-semibold">
            один presenter на ресурс → везде одинаковая форма товара
          </div>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 3 ? 'success' : 'accent'}
        captions={[
          'presentItem собирает ответ из строки БД — поле за полем',
          'Имена колонок snake_case → поля API camelCase',
          'Decimal("1990.00") → 1990: фронту — обычное число',
          'Лишнее наружу не уходит. Форма ответа — одна на ресурс',
        ]}
      />
    </SlideLayout>
  );
}
