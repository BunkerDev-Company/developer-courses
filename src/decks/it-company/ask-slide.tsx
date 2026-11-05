'use client';

import type { LucideIcon } from 'lucide-react';
import { AtSign, Hash, Hourglass, ListChecks, MessageSquareText, Timer } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { PEOPLE, TASK } from './data';
import { ChatLine, ChatWindow } from './parts';

/**
 * Один и тот же блокер со стендапа — два способа спросить.
 * 0 — плохо: «привет» в личку и тишина, 1 — хорошо: всё в одном сообщении в канале, 2 — правила.
 * Команды — из etalon-backend (README): migrate:up и Postgres в Docker-контейнере etalon-pg.
 */

const RULES: { icon: LucideIcon; text: string }[] = [
  { icon: MessageSquareText, text: 'Вопрос целиком — в одном сообщении' },
  { icon: ListChecks, text: 'Что делали и что уже пробовали' },
  { icon: Hash, text: 'В канал команды, а не в личку' },
  { icon: Timer, text: 'Застряли на полчаса — спросите' },
];

const CHAT_W = 700;
const CHAT_H = 400;
const RULES_TOP = 418;

export function AskSlide({ step }: SlideProps) {
  const { you, dev } = PEOPLE;
  return (
    <SlideLayout section="culture" title="Как задать вопрос в чате">
      {/* Плохо */}
      <ChatWindow
        channel={dev.name}
        icon={AtSign}
        aside="личные сообщения"
        active={step === 0}
        tone="danger"
        className={cn('absolute transition-opacity duration-300', step === 1 && 'opacity-50')}
        style={{ left: 0, top: 0, width: CHAT_W, height: CHAT_H }}
      >
        <ChatLine who={you.name} role={you.role} time="10:02">
          Привет
        </ChatLine>
        <div className="flex items-center justify-center gap-2.5 text-[19px] font-semibold text-muted">
          <Hourglass size={20} /> 20 минут тишины…
        </div>
        <ChatLine who={dev.name} role={dev.role} time="10:24">
          Привет. Что случилось?
        </ChatLine>
        <ChatLine who={you.name} role={you.role} time="10:25">
          у меня не работает
        </ChatLine>
        <ChatLine who={dev.name} role={dev.role} time="10:31">
          Что именно не работает?
        </ChatLine>
      </ChatWindow>

      {/* Хорошо */}
      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: 1440 - CHAT_W, top: 0, width: CHAT_W }}>
        <ChatWindow channel="team-cart" aside="канал команды" active={step === 1} tone="success" style={{ height: CHAT_H }}>
          <ChatLine who={you.name} role={you.role} time="10:02">
            Привет! Делаю {TASK.key}. <M>npm run migrate:up</M> падает: ECONNREFUSED на localhost:5432. Проверил .env — адрес верный. Куда смотреть?
          </ChatLine>
          <ChatLine who={dev.name} role={dev.role} time="10:05">
            Похоже, не запущен Postgres. Если он в Docker: <M>docker start etalon-pg</M>
          </ChatLine>
          <ChatLine who={you.name} role={you.role} time="10:07">
            Заработало, спасибо!
          </ChatLine>
        </ChatWindow>
      </Reveal>

      {/* Правила */}
      {RULES.map((r, i) => (
        <Reveal key={r.text} show={step >= 2} delay={i * 0.12} className="absolute" style={{ left: i * (345 + 20), top: RULES_TOP, width: 345 }}>
          <div className="card flex items-center gap-4 border-guard/40 px-5" style={{ height: 104 }}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-guard/10 text-guard">
              <r.icon size={26} />
            </span>
            <span className="text-[22px] font-semibold leading-snug">{r.text}</span>
          </div>
        </Reveal>
      ))}

      <StepCaption
        step={step}
        tone={step === 0 ? 'danger' : step === 1 ? 'success' : 'guard'}
        captions={[
          '«Привет» в личку — и тишина. Помощь растянулась на полчаса',
          'Всё в одном сообщении — ответ через три минуты',
          'Спрашивать — нормально. Главное, чтобы было легко ответить',
        ]}
      />
    </SlideLayout>
  );
}
