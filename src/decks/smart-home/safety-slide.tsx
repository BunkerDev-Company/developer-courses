'use client';

import type { LucideIcon } from 'lucide-react';
import { CloudDownload, CopyCheck, KeyRound, LockKeyhole, ShieldCheck, WifiOff } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги — по колонке: 0 надёжность (оффлайн, дубли), 1 доступ (TLS, свой ключ + ACL),
 * 2 доверие (проверки на бэкенде, обновление прошивки).
 */

interface Card {
  title: string;
  icon: LucideIcon;
  tone: Tone;
  text: string;
  code?: string;
}

const COLUMNS: Card[][] = [
  [
    { title: 'Пропал из сети', icon: WifiOff, tone: 'danger', text: 'Last Will скажет offline. Команда ждёт в desired', code: 'last_seen_at' },
    { title: 'Пришло дважды', icon: CopyCheck, tone: 'warning', text: 'QoS 1 может повторить. У команды есть id — повтор игнорируем', code: '{"id":"c-81","target":90}' },
  ],
  [
    { title: 'Шифрование', icon: LockKeyhole, tone: 'success', text: 'Пароль и команды не летят открытым текстом', code: 'mqtts://broker:8883' },
    { title: 'Свой ключ', icon: KeyRound, tone: 'guard', text: 'У каждого устройства — свой логин. Писать можно только в свои топики', code: 'pattern readwrite dev/%u/#' },
  ],
  [
    { title: 'Никому не верим', icon: ShieldCheck, tone: 'logic', text: 'Чайник прислал 500°? Приложение — чужой id? Проверяет бэкенд' },
    { title: 'Обновление прошивки', icon: CloudDownload, tone: 'db', text: 'Только подписанное — и с откатом, если не загрузилось' },
  ],
];

const GAP = 28;
const COL_W = (1440 - GAP * 2) / 3;
const CARD_H = 258;

export function SafetySlide({ step }: SlideProps) {
  return (
    <SlideLayout section="home" title="Надёжность и безопасность">
      {COLUMNS.map((col, ci) =>
        col.map((c, ri) => {
          const t = TONE[c.tone];
          return (
            <Reveal
              key={c.title}
              show={step >= ci}
              from="up"
              delay={ri * 0.12}
              className="absolute"
              style={{ left: ci * (COL_W + GAP), top: ri * (CARD_H + 26), width: COL_W, height: CARD_H }}
            >
              <div className={cn('card flex h-full flex-col gap-3 border-l-[6px] px-6 py-5 transition-shadow duration-300', t.border, step === ci && t.ring)}>
                <span className="flex items-center gap-3">
                  <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                    <c.icon size={26} />
                  </span>
                  <span className="text-[27px] font-bold leading-tight">{c.title}</span>
                </span>
                <span className="text-[23px] leading-snug">{c.text}</span>
                {c.code && <span className="mt-auto self-start rounded-lg bg-code-bg px-3 py-1.5 font-mono text-[19px] text-code-text">{c.code}</span>}
              </div>
            </Reveal>
          );
        }),
      )}

      <StepCaption
        step={step}
        tone={step === 0 ? 'danger' : step === 1 ? 'success' : 'logic'}
        captions={[
          'Связь рвётся, сообщения дублируются — это норма, а не авария',
          'У каждого устройства свой ключ, весь трафик — через TLS',
          'Проверяем всё на бэкенде — даже то, что прислал свой чайник',
        ]}
      />
    </SlideLayout>
  );
}
