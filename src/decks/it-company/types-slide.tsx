'use client';

import type { LucideIcon } from 'lucide-react';
import { Briefcase, Building2, Rocket, ThumbsDown, ThumbsUp, Users, Workflow } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';
import { Pill } from '../what-is-backend/parts';

/** Шаги 0–2: по типу компании на шаг. Шаг 3: сравнить все и сделать вывод. */

interface Kind {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  size: string;
  how: string;
  plus: string;
  minus: string;
  caption: string;
}

const KINDS: Kind[] = [
  {
    tone: 'git',
    icon: Rocket,
    title: 'Стартап',
    size: '5–50 человек',
    how: 'быстро: процессов мало, все делают всё',
    plus: 'много ответственности — растёшь быстро',
    minus: 'мало наставников, хаос, может закрыться',
    caption: 'Стартап: маленький, быстрый, все делают всё',
  },
  {
    tone: 'ctrl',
    icon: Building2,
    title: 'Продуктовая компания',
    size: 'сотни и тысячи',
    how: 'свой продукт, команды, понятные процессы',
    plus: 'стажировки, наставники, понятный рост',
    minus: 'узкая зона, много согласований',
    caption: 'Продуктовая компания: свой продукт, процессы, стажировки',
  },
  {
    tone: 'prisma',
    icon: Briefcase,
    title: 'Аутсорс',
    size: 'от десятков до тысяч',
    how: 'делают проекты для других компаний',
    plus: 'много разных проектов и технологий',
    minus: 'сроки заказчика, бывают переработки',
    caption: 'Аутсорс: проекты на заказ — много, быстро и разное',
  },
];

const CARD_W = 460;
const GAP = 30;
const CARD_H = 530;

function Row({ icon: Icon, label, tone, children }: { icon: LucideIcon; label: string; tone?: Tone; children: React.ReactNode }) {
  return (
    <div>
      <div className={cn('flex items-center gap-2 text-[17px] font-semibold uppercase tracking-wider', tone ? TONE[tone].text : 'text-muted')}>
        <Icon size={19} strokeWidth={2.5} />
        {label}
      </div>
      <div className="mt-1.5 text-[24px] leading-snug">{children}</div>
    </div>
  );
}

export function TypesSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="culture" title="Компании бывают разные">
      {KINDS.map((k, i) => {
        const t = TONE[k.tone];
        return (
          <Reveal key={k.title} show={step >= i} from="up" className="absolute" style={{ left: i * (CARD_W + GAP), top: 0, width: CARD_W }}>
            <div className={cn('card flex flex-col gap-5 border-t-[6px] p-7 transition-shadow duration-300', t.border, i === step && t.ring)} style={{ height: CARD_H }}>
              <div className="flex items-center gap-4">
                <span className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
                  <k.icon size={36} />
                </span>
                <div>
                  <div className="text-[30px] font-bold leading-tight">{k.title}</div>
                  <Pill tone={k.tone} icon={Users} className="mt-1.5 text-[18px]">
                    {k.size}
                  </Pill>
                </div>
              </div>
              <Row icon={Workflow} label="как работают">
                {k.how}
              </Row>
              <Row icon={ThumbsUp} label="новичку плюс" tone="success">
                {k.plus}
              </Row>
              <Row icon={ThumbsDown} label="новичку минус" tone="danger">
                {k.minus}
              </Row>
            </div>
          </Reveal>
        );
      })}

      <StepCaption step={step} tone={KINDS[step]?.tone ?? 'guard'} captions={[...KINDS.map((k) => k.caption), 'Лучшей нет. Для первой работы главное — наставник']} />
    </SlideLayout>
  );
}
