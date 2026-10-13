'use client';

import { motion } from 'framer-motion';
import { CircleCheck, CircleX, Globe } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TOKEN_CLASS } from '@/lib/highlight';
import { EASE, SPRING } from '@/lib/motion';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { ENVELOPE_FIELDS, valueOf } from './b-data';
import { DataLine, DataPanel, HEAD_H, PAD_Y } from './b-panel';
import { REQ } from './data';

/**
 * Шаги:
 * 0 — хендлер вернул голый объект (после presenter)
 * 1 — ResponseInterceptor кладёт его в data + служебные поля; BigIntInterceptor
 * 2 — 201 Created с конвертом уходит в браузер
 * 3 — axios-интерсептор снимает конверт один раз → React получает чистый товар
 */

// То, что лежит в data (из ENVELOPE_JSON), — в две строки, чтобы влезло в слот.
const DATA_VALUE = valueOf(ENVELOPE_FIELDS, 'data');
const SPLIT = DATA_VALUE.indexOf(' "price"');
const PAYLOAD_LINES = [DATA_VALUE.slice(0, SPLIT), `  ${DATA_VALUE.slice(SPLIT + 1)}`];
const META = ENVELOPE_FIELDS.filter((f) => f.key !== 'data');

// Геометрия конверта.
const ENV_TOP = 140;
const ENV_W = 690;
const SLOT_ROW_H = 92;
const SLOT_LEFT = 24 + 8 * 11.4 + 6; // px-6 + `"data": `
const SLOT_TOP = ENV_TOP + HEAD_H + PAD_Y + (SLOT_ROW_H - 80) / 2;
const PAYLOAD_W = 528;

const BROWSER_LEFT = 790;
const BROWSER_W = 650;

const AXIOS = `api.interceptors.response.use((response) => {
  if ('data' in response.data)
    response.data = response.data.data;
  return response;
});`;

export function InterceptorSlide({ step }: SlideProps) {
  const inside = step >= 1;
  const sent = step >= 2;
  const unwrapped = step >= 3;

  return (
    <SlideLayout section="request" title="Interceptor: конверт ответа">
      {/* ── Что вернул хендлер ───────────────────────────────────── */}
      <div className="absolute flex items-center gap-3" style={{ left: 0, top: 0 }}>
        <span className="text-[22px] font-semibold text-text-2">Хендлер вернул</span>
        <Chip tone="logic">return presentItem(item)</Chip>
      </div>

      {/* ── Конверт ResponseInterceptor ──────────────────────────── */}
      <motion.div
        className={cn('absolute rounded-2xl transition-shadow duration-300', step === 1 && TONE.success.ring)}
        style={{ left: 0, top: ENV_TOP, width: ENV_W }}
      >
        <DataPanel title="ResponseInterceptor — конверт для любого ответа" tone="success">
          <div className="relative flex items-start px-6 font-mono text-[19px]" style={{ height: SLOT_ROW_H }}>
            <span className="leading-[38px]" style={{ marginTop: 15 }}>
              <span className={TOKEN_CLASS.prop}>&quot;data&quot;</span>
              <span className="text-code-text">: </span>
            </span>
            <motion.div
              className="absolute rounded-xl border-2 border-dashed border-code-line/30"
              style={{ left: SLOT_LEFT, top: (SLOT_ROW_H - 80) / 2, width: PAYLOAD_W + 8, height: 80 }}
              initial={false}
              animate={{ opacity: inside ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex h-full items-center justify-center font-sans text-[18px] text-code-comment">
                сюда — то, что вернул хендлер
              </div>
            </motion.div>
          </div>
          {META.map((f, i) => (
            <DataLine
              key={f.key}
              json
              k={f.key}
              v={`${f.value}${i < META.length - 1 ? ',' : ''}`}
              state={step === 0 ? 'dim' : step === 1 ? 'hl' : 'normal'}
              tone="success"
            />
          ))}
        </DataPanel>
      </motion.div>

      {/* Сам объект: сверху → в слот data */}
      <motion.div
        className={cn(
          'absolute z-10 rounded-xl border-2 bg-code-bg px-4 py-2 font-mono text-[19px] leading-[28px] shadow-lift',
          inside ? 'border-success/60' : TONE.logic.border,
        )}
        style={{ left: 0, top: 0, width: PAYLOAD_W }}
        initial={false}
        animate={inside ? { x: SLOT_LEFT + 4, y: SLOT_TOP + 4 } : { x: 0, y: 44 }}
        transition={SPRING}
      >
        {PAYLOAD_LINES.map((l) => (
          <JsonLine key={l} text={l} />
        ))}
      </motion.div>

      <Reveal show={inside} delay={0.4} className="absolute flex items-center gap-3" style={{ left: 0, top: ENV_TOP + 330 }}>
        <Chip tone="success">BigIntInterceptor</Chip>
        <span className="text-[22px] text-text-2">ещё один: BigInt → строка, JSON не умеет BigInt</span>
      </Reveal>

      {/* ── Сеть ─────────────────────────────────────────────────── */}
      <Arrow
        show={sent}
        from={[ENV_W + 6, ENV_TOP + 150]}
        to={[BROWSER_LEFT - 6, 112]}
        curve={-20}
        tone="success"
        flow={step === 2}
      />

      {/* ── Браузер ──────────────────────────────────────────────── */}
      <motion.div
        className={cn('absolute rounded-3xl border-2 border-dashed bg-surface/50', TONE.client.borderSoft)}
        style={{ left: BROWSER_LEFT, top: 0, width: BROWSER_W, height: 556 }}
        initial={false}
        animate={{ opacity: sent ? 1 : 0.4 }}
        transition={{ duration: 0.4, ease: EASE }}
      />
      <div className="absolute flex items-center gap-3" style={{ left: BROWSER_LEFT + 24, top: 16 }}>
        <Globe size={28} className="text-client" />
        <span className="text-[24px] font-bold">Браузер</span>
        <span className="font-mono text-[17px] text-text-2">etalon-frontend</span>
      </div>

      <Reveal show={sent} from="left" className="absolute" style={{ left: BROWSER_LEFT + 24, top: 68, width: BROWSER_W - 48 }}>
        <div className="mb-2 flex items-center gap-3">
          <Chip tone="success" solid>
            201 Created
          </Chip>
          <span className="text-[20px] text-text-2">пришёл весь конверт</span>
        </div>
        <div
          className={cn(
            'rounded-xl bg-code-bg px-4 py-2 font-mono text-[19px] transition-opacity duration-300',
            unwrapped && 'opacity-40',
          )}
        >
          <span className="text-code-text">response.data = </span>
          <JsonInline text={'{ "data": {…}, "responseTime": 12, … }'.replace(' "responseTime": 12,', '')} />
        </div>
      </Reveal>

      <Reveal show={unwrapped} className="absolute" style={{ left: BROWSER_LEFT + 24, top: 168, width: BROWSER_W - 48 }}>
        <Code code={AXIOS} lang="ts" size="sm" title="lib/api.ts — один раз на все запросы" hl={[2, 3]} tone="client" />
      </Reveal>

      <Reveal
        show={unwrapped}
        delay={0.25}
        className="absolute"
        style={{ left: BROWSER_LEFT + 24, top: 406, width: BROWSER_W - 48 }}
      >
        <div className="card px-5 py-2.5 font-mono text-[19px] leading-[32px]">
          <div>
            <span className="text-logic">const</span> item = <span className="text-logic">await</span>{' '}
            itemsApi.create(payload);
          </div>
          <div className="flex items-center gap-3">
            <CircleCheck size={22} className="text-success" />
            item.title <span className="text-text-2">→ &quot;{REQ.body.title}&quot;</span>
          </div>
          <div className="flex items-center gap-3 font-sans text-[20px]">
            <CircleX size={22} className="text-danger" />
            <M className="line-through decoration-danger">res.data.data</M>
            <span className="text-text-2">— не пишем</span>
          </div>
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step >= 2 ? (step === 3 ? 'client' : 'success') : step === 1 ? 'success' : 'logic'}
        captions={[
          'Хендлер вернул только товар — про конверт он не знает',
          'ResponseInterceptor кладёт его в data и добавляет служебные поля',
          'Наружу уходит 201 Created и весь конверт',
          'axios снимает конверт один раз — React получает чистый товар',
        ]}
      />
    </SlideLayout>
  );
}

/** Строка JSON с подсветкой (отступы сохраняем). */
function JsonLine({ text }: { text: string }) {
  return (
    <div className="whitespace-pre">
      <JsonInline text={text} />
    </div>
  );
}

function JsonInline({ text }: { text: string }) {
  // Простая подсветка: ключи, строки, числа.
  const parts = text.split(/("(?:[^"\\]|\\.)*"(?=\s*:)|"(?:[^"\\]|\\.)*"|\b\d+\b)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        const isKey = /^".*"$/.test(p) && /^\s*:/.test(parts[i + 1] ?? '');
        const cls = isKey
          ? TOKEN_CLASS.prop
          : p.startsWith('"')
            ? TOKEN_CLASS.string
            : /^\d+$/.test(p)
              ? TOKEN_CLASS.number
              : 'text-code-text';
        return (
          <span key={i} className={cls}>
            {p}
          </span>
        );
      })}
    </>
  );
}
