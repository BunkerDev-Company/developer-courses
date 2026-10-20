import type { LucideIcon } from 'lucide-react';
import {
  ChefHat,
  ClipboardList,
  ConciergeBell,
  CookingPot,
  HandPlatter,
  Headset,
  ReceiptText,
  Refrigerator,
  ShieldCheck,
  Signpost,
  Soup,
  UserRound,
} from 'lucide-react';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

/**
 * Ресторан из «Что такое бэкенд», только подробнее: у каждого слоя NestJS — свой работник.
 * Общий словарь для презентаций «Зал» и «Кухня»: имена, иконки и цвета не расходятся.
 */

export type RoleKey =
  | 'guest'
  | 'guard'
  | 'host'
  | 'waiter'
  | 'ticket'
  | 'pass'
  | 'cook'
  | 'tools'
  | 'storage'
  | 'plate'
  | 'tray'
  | 'manager';

export interface RoleDef {
  /** Кто в ресторане. */
  name: string;
  /** Кто в NestJS. */
  tech: string;
  /** Что делает — в двух-трёх словах. */
  job: string;
  tone: Tone;
  icon: LucideIcon;
}

export const ROLES: Record<RoleKey, RoleDef> = {
  guest: { name: 'Гость', tech: 'браузер', job: 'делает заказ', tone: 'client', icon: UserRound },
  guard: { name: 'Охранник', tech: 'Guards', job: 'пускает внутрь', tone: 'guard', icon: ShieldCheck },
  host: { name: 'Хостес', tech: 'роутинг', job: 'ведёт к официанту', tone: 'ctrl', icon: Signpost },
  waiter: { name: 'Официант', tech: 'Controller', job: 'принимает заказ', tone: 'ctrl', icon: ConciergeBell },
  ticket: { name: 'Чек', tech: 'Command', job: 'что заказали', tone: 'logic', icon: ReceiptText },
  pass: { name: 'Раздача', tech: 'CommandBus', job: 'отдаёт чек повару', tone: 'logic', icon: ClipboardList },
  cook: { name: 'Повар', tech: 'Handler', job: 'готовит', tone: 'logic', icon: ChefHat },
  tools: { name: 'Техника', tech: 'сервисы', job: 'плита, холодильник', tone: 'muted', icon: CookingPot },
  storage: { name: 'Склад', tech: 'Prisma + БД', job: 'хранит продукты', tone: 'db', icon: Refrigerator },
  plate: { name: 'Тарелка', tech: 'Presenter', job: 'красиво выложить', tone: 'success', icon: Soup },
  tray: { name: 'Поднос', tech: 'Interceptor', job: 'одинаковая подача', tone: 'success', icon: HandPlatter },
  manager: { name: 'Менеджер', tech: 'ExceptionFilter', job: 'разбирает жалобы', tone: 'danger', icon: Headset },
};

/** Плашка в шапке слайда: «в ресторане — Официант». Передаётся в `SlideLayout aside`. */
export function RoleBadge({ role }: { role: RoleKey }) {
  const r = ROLES[role];
  const t = TONE[r.tone];
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border-2 bg-surface py-2 pl-2.5 pr-5 shadow-card', t.borderSoft)}>
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', t.soft, t.text)}>
        <r.icon size={28} />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold uppercase tracking-wider text-muted">в ресторане</div>
        <div className="text-[24px] font-bold">{r.name}</div>
      </div>
    </div>
  );
}
