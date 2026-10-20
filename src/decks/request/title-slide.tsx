'use client';

import { Reveal } from '@/components/ui/reveal';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { ROLES, type RoleKey } from './restaurant';

interface Props {
  /** Какая часть дополнения к «Бэкенд изнутри»: 1 или 2. */
  part: number;
  title: string;
  subtitle: string;
  /** Работники ресторана, про которых эта лекция, — карточками. */
  roles: { role: RoleKey; text: string }[];
}

/** Титул «Зала» и «Кухни» (дополнение к «Бэкенд изнутри»): темы — работники ресторана. */
export function RequestTitle({ part, title, subtitle, roles }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-24 pb-10">
      <Reveal from="down">
        <div className="eyebrow text-center text-accent">«Бэкенд изнутри» с нуля · часть {part} из 2</div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="mt-5 text-center text-[88px] font-extrabold leading-[1.05] tracking-tight">{title}</h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-5 text-center text-[32px] text-text-2">{subtitle}</p>
      </Reveal>

      <div className="mt-20 grid w-full gap-8" style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))` }}>
        {roles.map((x, i) => {
          const r = ROLES[x.role];
          const t = TONE[r.tone];
          return (
            <Reveal key={x.role} from="up" delay={0.35 + i * 0.15}>
              <div className={cn('card flex h-full flex-col gap-4 border-t-[6px] p-8', t.border)}>
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', t.soft, t.text)}>
                    <r.icon size={36} />
                  </div>
                  <span className={cn('font-mono text-[20px] font-semibold', t.text)}>{r.tech}</span>
                </div>
                <div className="text-[38px] font-bold">{r.name}</div>
                <div className="text-[24px] leading-snug text-text-2">{x.text}</div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
