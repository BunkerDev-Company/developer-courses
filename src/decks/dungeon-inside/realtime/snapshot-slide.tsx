'use client';

import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { Card, Console } from '../parts';

/**
 * Шаги:
 * 0 — снимок 20 раз в секунду: основной трафик, байты экономим
 * 1 — encodeSnapshot: поле за полем в байты
 * 2 — у каждого игрока свой снимок: область интереса + свой герой точно (float32)
 * 3 — volatile: не успел — выбросили; формат append-only
 */

// Значения — из комментария в начале domain/shared/protocol.ts.
const FIELDS: { what: string; json: string; bin: string; how: string }[] = [
  { what: 'координата', json: '"x": 12.53', bin: 'u16 · 2 байта', how: 'тайлы × 256: точность 1/256 тайла' },
  { what: 'угол', json: '"aim": 1.5708', bin: 'u8 · 1 байт', how: 'полный круг = 256' },
  { what: 'HP моба', json: '"hp": 0.62', bin: 'u8 · 1 байт', how: 'доля 0..255' },
];

// protocol.ts — encodeSnapshot, выдержка.
const ENCODE = `export function encodeSnapshot(w: ByteWriter, s: Snapshot): Uint8Array {
  w.reset();
  w.u8(MSG_SNAPSHOT);
  w.u8(SNAPSHOT_VERSION);
  w.u32(s.tick);
  w.u32(s.ack);
  …
  w.u8(s.players.length);
  for (const p of s.players) {
    w.u8(p.pid);
    w.pos(p.x);
    w.pos(p.y);
    w.u16(p.hp);
    …`;

// protocol.ts — комментарий перенесён по ширине; блок self из encodeSnapshot.
const AOI = `/** Радиус «области интереса»: дальше этого
 *  от героя мобы/снаряды не шлём. */
export const AOI_RADIUS = 24;
…
if (s.self) {
  const m = s.self;
  w.u8(1);
  w.f32(m.x);
  w.f32(m.y);
  …`;

// gateways/game.gateway.ts — комментарий перенесён по ширине.
const VOLATILE = `emitSnapshot(socketId: string, bytes: Uint8Array) {
  // volatile: если сокет не успевает — снимок выбрасываем,
  // следующий свежее. Устаревший снимок никому не нужен,
  // а очередь из них — это лаг.
  this.server.sockets.get(socketId)?.volatile.emit('snap', bytes);
}`;

const CODE_W = 880;
const RX = CODE_W + 40;
const RW = 1440 - RX;

export function SnapshotSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="realtime" title="Снимок мира — байты, а не JSON">
      <div className="absolute" style={{ left: 0, top: 0, width: CODE_W }}>
        <Swap k={step}>
          {step === 0 && (
            <div className="card overflow-hidden">
              <div className="grid border-b-2 border-border bg-surface-2 px-5 py-3 text-[16px] font-semibold uppercase tracking-wider text-muted" style={{ gridTemplateColumns: '170px 220px 190px 1fr' }}>
                <span>поле</span>
                <span>JSON</span>
                <span>в снимке</span>
                <span>как</span>
              </div>
              {FIELDS.map((f) => (
                <div key={f.what} className="grid items-center border-b border-border/70 px-5 py-4" style={{ gridTemplateColumns: '170px 220px 190px 1fr' }}>
                  <span className="text-[23px] font-semibold">{f.what}</span>
                  <span className="font-mono text-[19px] text-text-2">{f.json}</span>
                  <span className="font-mono text-[19px] font-semibold text-logic">{f.bin}</span>
                  <span className="text-[19px] text-text-2">{f.how}</span>
                </div>
              ))}
              <div className="px-5 py-4 text-[23px]">
                «JSON того же снимка весит в <b>~8–10 раз больше</b> (проверьте в netgraph).»
              </div>
            </div>
          )}
          {step === 1 && <Code code={ENCODE} lang="ts" size="sm" title="domain/shared/protocol.ts — encodeSnapshot" hl={[3, 4, 5, 6, 11, 12]} tone="logic" />}
          {step === 2 && <Code code={AOI} lang="ts" size="sm" title="domain/shared/protocol.ts" hl={[3, 8, 9]} tone="logic" />}
          {step === 3 && <Code code={VOLATILE} lang="ts" size="sm" title="gateways/game.gateway.ts" hl={[5]} tone="logic" />}
        </Swap>
      </div>

      <div className="absolute" style={{ left: RX, top: 0, width: RW }}>
        <Swap k={step}>
          {step === 0 && (
            <Card tone="logic" title="20 снимков в секунду">
              <div className="text-[23px] leading-snug">Это основной трафик игры — поэтому каждое поле упаковано в минимум байт.</div>
            </Card>
          )}
          {step === 1 && (
            <Card tone="logic" title="Первым — версия">
              <div className="text-[23px] leading-snug">
                <M>SNAPSHOT_VERSION</M>: клиент со старым форматом поймёт, что снимок не для него, а не нарисует мусор.
              </div>
            </Card>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <Card tone="logic" title="У каждого — свой снимок">
                <div className="text-[22px] leading-snug">Мобы — только в 24 тайлах от героя. Свой герой — float32: клиенту нужна точная позиция для предсказания.</div>
              </Card>
              <Console
                title="sim-bench, 4 героя"
                lines={[{ text: 'снимок: в среднем 218 Б, 4 КБ/с на игрока', kind: 'ok' }]}
              />
            </div>
          )}
          {step === 3 && (
            <Card tone="warning" title="Формат append-only">
              <div className="flex flex-col gap-2 text-[22px] leading-snug">
                <span>Порядок в MOB_TYPES, FX, STATUSES… — часть бинарного формата.</span>
                <span>Новое — в конец. Ломающее — новый SNAPSHOT_VERSION.</span>
                <span className="text-text-2">Сдвинули порядок — клиент рисует не тех мобов.</span>
              </div>
            </Card>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 3 ? 'warning' : 'logic'}
        captions={[
          'Снимок мира уходит 20 раз в секунду — каждый байт на счету',
          'encodeSnapshot пишет поле за полем: версия, тик, ack, герои, мобы…',
          'У каждого игрока свой снимок: только то, что рядом, и свой герой точно',
          <>
            <M>volatile</M>: не успел уйти — выбросили, следующий свежее
          </>,
        ]}
      />
    </SlideLayout>
  );
}
