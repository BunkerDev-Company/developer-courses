'use client';

import type { LucideIcon } from 'lucide-react';
import { Archive, Repeat, Unplug } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { T, TOPIC } from './data';

/**
 * Шаги: 0 — QoS, 1 — retain, 2 — Last Will, 3 — что мы ставим на каждый топик чайника.
 * Поведение retain и Last Will проверено: mqtt.js 5 + брокер aedes (см. notes).
 */

interface Card {
  title: string;
  icon: LucideIcon;
  tone: Tone;
  lines: React.ReactNode[];
}

const CARDS: Card[] = [
  {
    title: 'QoS — сколько раз',
    icon: Repeat,
    tone: T.broker,
    lines: [
      <><b>0</b> — не больше раза: может потеряться</>,
      <><b>1</b> — хотя бы раз: возможен дубль</>,
      <><b>2</b> — ровно раз: самый медленный</>,
    ],
  },
  {
    title: 'retain — брокер помнит',
    icon: Archive,
    tone: T.db,
    lines: ['Последнее сообщение топика хранится у брокера', 'Новый подписчик получает его сразу'],
  },
  {
    title: 'Last Will — завещание',
    icon: Unplug,
    tone: 'danger',
    lines: ['Оставляем брокеру при подключении', 'Связь оборвалась без «пока» — брокер сам публикует offline'],
  },
];

const ROWS: { topic: string; qos: string; retain: string; why: string; danger?: boolean }[] = [
  { topic: TOPIC.state, qos: '1', retain: 'да', why: 'приложение сразу видит последнее состояние' },
  { topic: TOPIC.availability, qos: '1', retain: 'да + will', why: 'брокер сам скажет offline' },
  { topic: TOPIC.set, qos: '1', retain: 'нет!', why: 'иначе чайник вскипит при каждом переподключении', danger: true },
];

const GAP = 36;
const CARD_W = (1440 - GAP * 2) / 3;
const GRID = '420px 90px 150px 1fr';

export function FlagsSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="protocols" title="QoS, retain и завещание">
      {CARDS.map((c, i) => {
        const t = TONE[c.tone];
        return (
          <Reveal key={c.title} show={step >= i} from="up" className="absolute" style={{ left: i * (CARD_W + GAP), top: 0, width: CARD_W, height: 262 }}>
            <div className={cn('card flex h-full flex-col gap-4 border-t-[6px] p-6 transition-shadow duration-300', t.border, step === i && t.ring)}>
              <div className="flex items-center gap-3">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                  <c.icon size={26} />
                </div>
                <span className="text-[27px] font-bold leading-tight">{c.title}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {c.lines.map((l, j) => (
                  <span key={j} className="text-[23px] leading-snug">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        );
      })}

      <Reveal show={step === 3} from="up" className="absolute" style={{ left: 0, top: 290, width: 1440 }}>
        <div className="card overflow-hidden">
          <div
            className="grid items-center border-b-2 border-border bg-surface-2 px-6 text-[16px] font-semibold uppercase tracking-wider text-muted"
            style={{ gridTemplateColumns: GRID, height: 40 }}
          >
            <span>топик чайника</span>
            <span>QoS</span>
            <span>retain</span>
            <span>почему так</span>
          </div>
          {ROWS.map((r) => (
            <div
              key={r.topic}
              className={cn('relative grid items-center px-6 text-[22px]', r.danger && 'bg-danger/5')}
              style={{ gridTemplateColumns: GRID, height: 64 }}
            >
              {r.danger && <span className="absolute inset-y-0 left-0 w-1.5 bg-danger" />}
              <span className="font-mono text-[20px] font-semibold">{r.topic}</span>
              <span className="font-mono">{r.qos}</span>
              <span className={cn('font-semibold', r.danger ? 'text-danger' : 'text-success')}>{r.retain}</span>
              <span className={r.danger ? 'font-semibold text-danger' : 'text-text-2'}>{r.why}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 0 ? T.broker : step === 1 ? T.db : 'danger'}
        captions={[
          'QoS: 0 — может потеряться, 1 — дойдёт, но бывают дубли, 2 — ровно раз',
          'retain: брокер помнит последнее сообщение и сразу отдаёт новым подписчикам',
          'Last Will: если чайник пропал без «пока», брокер сам сообщит offline',
          'Команду не делаем retained — иначе чайник вскипит после каждого переподключения',
        ]}
      />
    </SlideLayout>
  );
}
