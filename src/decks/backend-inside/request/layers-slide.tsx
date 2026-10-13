'use client';

import type { LucideIcon } from 'lucide-react';
import { Braces, Cog, Mail, Route, Send, Settings, ShieldCheck, Triangle } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги (группами, по пути запроса):
 * 0 — вход: main.ts, Guard, Controller + DTO
 * 1 — логика: Command/Query, Handler, PrismaService
 * 2 — выход: Presenter, Interceptor / Filter
 */

const LAYERS: { name: string; path: string; question: string; tone: Tone; icon: LucideIcon; group: number }[] = [
  { name: 'main.ts', path: 'src/main.ts', question: 'Как настроен сервер: /api/v1, CORS, интерсепторы', tone: 'muted', icon: Settings, group: 0 },
  { name: 'Guard', path: 'common/guards/', question: 'Кто ты и можно ли тебе сюда?', tone: 'guard', icon: ShieldCheck, group: 0 },
  { name: 'Controller + DTO', path: 'controllers/ + dto/', question: 'Какой адрес → какая команда? Форма входа?', tone: 'ctrl', icon: Route, group: 0 },
  { name: 'Command / Query', path: 'application/commands/ · queries/', question: 'Что хотим сделать?', tone: 'logic', icon: Send, group: 1 },
  { name: 'Handler', path: 'application/handlers/', question: 'Как это сделать? — вся логика здесь', tone: 'logic', icon: Cog, group: 1 },
  { name: 'PrismaService', path: 'infrastructure/prisma/', question: 'Как поговорить с базой?', tone: 'prisma', icon: Triangle, group: 1 },
  { name: 'Presenter', path: 'application/presenters/', question: 'Как показать данные наружу?', tone: 'success', icon: Braces, group: 2 },
  { name: 'Interceptor / Filter', path: 'common/interceptors/ · filters/', question: 'В какой конверт завернуть ответ / ошибку?', tone: 'success', icon: Mail, group: 2 },
];

const GRID = '360px 400px 1fr';
const ROW_H = 58;
const ROW_GAP = 6;
const HEAD_H = 36;

export function LayersSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="request" title="Кто за что отвечает">
      <div
        className="absolute grid items-center px-6 text-[16px] font-semibold uppercase tracking-wider text-muted"
        style={{ left: 0, top: 0, width: 1440, height: HEAD_H, gridTemplateColumns: GRID }}
      >
        <span>слой</span>
        <span>где лежит</span>
        <span>на какой вопрос отвечает</span>
      </div>

      {LAYERS.map((l, i) => {
        const t = TONE[l.tone];
        const current = l.group === step;
        return (
          <Reveal
            key={l.name}
            show={step >= l.group}
            from="left"
            delay={current ? (i % 3) * 0.1 : 0}
            className="absolute"
            style={{ left: 0, top: HEAD_H + 4 + i * (ROW_H + ROW_GAP), width: 1440 }}
          >
            <div
              className={cn(
                'relative grid items-center overflow-hidden rounded-2xl border-2 bg-surface px-6 shadow-card transition-[border-color,box-shadow] duration-300',
                current ? cn(t.borderSoft, t.ring) : 'border-border',
              )}
              style={{ height: ROW_H, gridTemplateColumns: GRID }}
            >
              <span className={cn('absolute inset-y-0 left-0 w-2', t.bg)} />
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                  <l.icon size={22} />
                </div>
                <span className="text-[24px] font-bold">{l.name}</span>
              </div>
              <span className="truncate font-mono text-[19px] text-text-2">{l.path}</span>
              <span className={cn('text-[24px]', current ? 'font-semibold' : 'text-text-2')}>{l.question}</span>
            </div>
          </Reveal>
        );
      })}

      <StepCaption
        step={step}
        tone={step === 0 ? 'guard' : step === 1 ? 'logic' : 'success'}
        captions={[
          'Вход: настроить сервер, пустить, принять запрос',
          'Середина: что сделать и как — здесь вся логика',
          'Выход: какой формы ответ и в каком конверте',
        ]}
      />
    </SlideLayout>
  );
}
