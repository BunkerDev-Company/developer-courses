'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Bell, ChefHat, CookingPot, Headset, Triangle, TriangleAlert } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { Reveal } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { RoleBadge } from '../request/restaurant';

/**
 * Шаги:
 * 0 — три сервиса etalon: что умеют; сервис — обычный класс с @Injectable()
 * 1 — кто ими пользуется: PrismaService один на всех
 * 2 — сервис пользуется сервисом: ErrorService → PrismaService; фильтр ошибок → ErrorService
 * 3 — правило: логика магазина — в хендлере, техника — в сервисе
 */

type SvcKey = 'prisma' | 'errors' | 'notify';

const SERVICES: { key: SvcKey; name: string; analog: string; tone: Tone; icon: LucideIcon; methods: string[]; top: number }[] = [
  { key: 'prisma', name: 'PrismaService', analog: 'дверь на склад', tone: 'prisma', icon: Triangle, methods: ['item.create()', 'item.findMany()'], top: 0 },
  { key: 'errors', name: 'ErrorService', analog: 'журнал жалоб', tone: 'danger', icon: TriangleAlert, methods: ['throw()', 'log()'], top: 190 },
  { key: 'notify', name: 'NotificationService', analog: 'колокольчик', tone: 'muted', icon: Bell, methods: ['send()'], top: 360 },
];
const SVC_W = 560;
const SVC_H = 136;

const USERS: { name: string; uses: SvcKey[]; filter?: boolean }[] = [
  { name: 'CreateItemHandler', uses: ['prisma', 'errors', 'notify'] },
  { name: 'UpdateItemHandler', uses: ['prisma', 'errors'] },
  { name: 'ListItemsHandler', uses: ['prisma'] },
  { name: 'LoginHandler', uses: ['prisma', 'errors'] },
  { name: 'GlobalExceptionFilter', uses: ['errors'], filter: true },
];
const USER_X = 680;
const USER_W = 1440 - USER_X;
const USER_H = 80;
const USER_STEP = 96;

/** Короткое имя сервиса на плашке у того, кто им пользуется. */
const SHORT: Record<SvcKey, string> = { prisma: 'Prisma', errors: 'Error', notify: 'Notification' };

const SVC_CODE = `@Injectable()
export class ErrorService {
  constructor(private readonly prisma: PrismaService) {}
  throw(key: AppErrorKey, details?: string): never { … }
  async log(exception: unknown, funcName: string) { … }
}`;

export function ServicesSlide({ step }: SlideProps) {
  const rule = step === 3;
  /** Какой сервис сейчас в фокусе: его плашки у потребителей залиты цветом. */
  const focus: SvcKey | null = step === 1 ? 'prisma' : step === 2 ? 'errors' : null;

  return (
    <SlideLayout section="request" title="Сервисы — общая техника кухни" aside={<RoleBadge role="tools" />}>
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: rule ? 0.15 : 1 }} transition={{ duration: 0.4 }}>
        {SERVICES.map((s) => {
          const t = TONE[s.tone];
          const on = (step === 1 && s.key === 'prisma') || (step === 2 && s.key !== 'notify');
          return (
            <div
              key={s.key}
              className={cn('card absolute flex flex-col justify-center gap-3 px-5 transition-[border-color,box-shadow] duration-300', on && cn(t.border, t.ring))}
              style={{ left: 0, top: s.top, width: SVC_W, height: SVC_H }}
            >
              <div className="flex items-center gap-3">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                  <s.icon size={26} />
                </div>
                <span className="font-mono text-[24px] font-bold">{s.name}</span>
                <span className="ml-auto text-[20px] text-text-2">{s.analog}</span>
              </div>
              <div className="flex gap-2.5">
                {s.methods.map((m) => (
                  <Chip key={m} tone={s.tone} className="text-[19px]">
                    {m}
                  </Chip>
                ))}
              </div>
              {s.key === 'prisma' && (
                <motion.div
                  className="absolute -right-4 -top-5"
                  initial={false}
                  animate={{ opacity: step === 1 ? 1 : 0, scale: step === 1 ? 1 : 0.6 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <Chip tone="prisma" solid>
                    ×1 на всё приложение
                  </Chip>
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Шаг 0: сервис — обычный класс */}
        <Reveal show={step === 0} delay={0.2} className="absolute" style={{ left: 640, top: 0, width: 800 }}>
          <Code code={SVC_CODE} lang="ts" size="sm" title="common/services/error.service.ts" hl={[1, 4, 5]} tone="danger" />
        </Reveal>

        {/* Шаги 1–2: кто пользуется — плашками, без паутины стрелок */}
        <Arrow show={step === 1} from={[USER_X - 8, 2 * USER_STEP + USER_H / 2]} to={[SVC_W + 8, SVC_H / 2]} curve={-40} tone="prisma" width={3} flow />
        <Arrow show={step === 2} from={[USER_X - 8, 4 * USER_STEP + USER_H / 2]} to={[SVC_W + 8, SERVICES[1].top + SVC_H / 2]} curve={40} tone="danger" width={3} flow />
        {USERS.map((u, i) => {
          const tone: Tone = u.filter ? 'danger' : 'logic';
          const t = TONE[tone];
          const Icon = u.filter ? Headset : ChefHat;
          const active = step === 2 && u.filter;
          return (
            <Reveal key={u.name} show={step >= 1} from="left" delay={i * 0.06} className="absolute" style={{ left: USER_X, top: i * USER_STEP, width: USER_W }}>
              <div
                className={cn('card flex items-center gap-4 px-5 transition-[border-color,box-shadow] duration-300', active && cn(t.border, t.ring))}
                style={{ height: USER_H }}
              >
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', t.soft, t.text)}>
                  <Icon size={24} />
                </div>
                <span className="font-mono text-[22px] font-semibold">{u.name}</span>
                <span className="ml-auto flex gap-2">
                  {u.uses.map((k) => {
                    const svc = SERVICES.find((s) => s.key === k)!;
                    return (
                      <Chip key={k} tone={focus && focus !== k ? 'muted' : svc.tone} solid={focus === k} size="sm">
                        {SHORT[k]}
                      </Chip>
                    );
                  })}
                </span>
              </div>
            </Reveal>
          );
        })}

        {/* Шаг 2: ErrorService сам пишет в базу через PrismaService */}
        <Arrow
          show={step === 2}
          from={[150, SERVICES[1].top - 6]}
          to={[150, SVC_H + 8]}
          tone="danger"
          width={3}
          label="log() → таблица ErrorLog"
          labelOffset={[150, 0]}
        />
      </motion.div>

      {/* Шаг 3: что куда класть */}
      <Reveal show={rule} from="scale" className="absolute" style={{ left: 120, top: 20, width: 1200 }}>
        <div className="grid grid-cols-2 gap-8">
          <RuleCard
            tone="logic"
            icon={ChefHat}
            title="Повар · Handler"
            sub="правила магазина"
            items={['цена ≥ 0', 'скрытый товар не показываем', 'создали товар → уведомить']}
          />
          <RuleCard
            tone="muted"
            icon={CookingPot}
            title="Техника · сервис"
            sub="как сделать технически"
            items={['запрос в базу', 'записать ошибку в ErrorLog', 'отправить уведомление']}
          />
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 1 ? 'prisma' : step === 2 ? 'danger' : 'logic'}
        captions={[
          <>
            Сервис — обычный класс с <M>@Injectable()</M>: база, ошибки, уведомления
          </>,
          'Один экземпляр на всё приложение — им пользуются все повара',
          'Сервис может пользоваться сервисом: ErrorService пишет в базу через Prisma',
          'Правила магазина — в хендлере. Техника — в сервисе',
        ]}
      />
    </SlideLayout>
  );
}

function RuleCard({ tone, icon: Icon, title, sub, items }: { tone: Tone; icon: LucideIcon; title: string; sub: string; items: string[] }) {
  const t = TONE[tone];
  return (
    <div className={cn('card border-t-[6px] p-7', t.border)}>
      <div className="flex items-center gap-4">
        <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', t.soft, t.text)}>
          <Icon size={30} />
        </div>
        <div>
          <div className="text-[30px] font-bold leading-tight">{title}</div>
          <div className="text-[22px] text-text-2">{sub}</div>
        </div>
      </div>
      <ul className="mt-5 flex flex-col gap-3">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-3 text-[26px]">
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', t.bg)} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
