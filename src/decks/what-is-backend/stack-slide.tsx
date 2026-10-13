'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Boxes, ChefHat, Container, Database, Hexagon, Table2, Triangle } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideProps } from '@/types';

/**
 * Шаги (стек собирается по кусочку):
 * 0 — Node.js (фундамент), 1 — NestJS сверху, 2 — PostgreSQL справа,
 * 3 — Prisma между кодом и базой, 4 — Docker упаковывает бэкенд в контейнер.
 */

interface LayerProps {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  version?: string;
  sub: string;
  /** Аналогия с рестораном. */
  like: string;
  active: boolean;
  /** Справа в шапке блока. */
  aside?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function Layer({ tone, icon: Icon, title, version, sub, like, active, aside, className, style, children }: LayerProps) {
  const t = TONE[tone];
  return (
    <div
      style={style}
      className={cn(
        'card flex flex-col p-5 transition-[border-color,box-shadow] duration-300',
        active && cn(t.border, t.ring),
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', t.soft, t.text)}>
          <Icon size={32} />
        </div>
        <span className="text-[32px] font-bold leading-none">{title}</span>
        {version && <Chip tone={tone} size="sm">{version}</Chip>}
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      <div className="mt-2 text-[23px] leading-snug text-text-2">{sub}</div>
      {children}
      <div className="mt-auto flex items-center gap-2 pt-2 text-[20px] font-medium text-text-2">
        <ChefHat size={22} className="shrink-0 text-muted" />≈ {like}
      </div>
    </div>
  );
}

// Координаты блоков в области контента.
const NEST = { left: 30, top: 84, width: 610, height: 222 };
const PRISMA = { left: 670, top: 84, width: 300, height: 222 };
const NODE = { left: 30, top: 324, width: 940, height: 192 };
const PG = { left: 1080, top: 84, width: 360, height: 432 };

export function StackSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="backend" title="Из чего состоит наш бэкенд">
      {/* 4 — Docker-контейнер вокруг бэкенда */}
      <motion.div
        className="absolute rounded-3xl border-[3px] border-dashed border-accent bg-accent/[0.04]"
        style={{ left: 0, top: 0, width: 1000, height: 540 }}
        initial={false}
        animate={{ opacity: step >= 4 ? 1 : 0, scale: step >= 4 ? 1 : 1.03 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="absolute left-7 top-4 flex items-center gap-3">
          <Container size={32} className="text-accent" />
          <span className="text-[30px] font-bold text-accent">Docker</span>
          <span className="text-[22px] text-text-2">— упаковывает бэкенд в контейнер</span>
          <Chip tone="accent" className="ml-2">docker compose up -d</Chip>
        </div>
      </motion.div>

      {/* 0 — Node.js */}
      <Reveal show from="up" className="absolute" style={NODE}>
        <Layer
          tone="success"
          icon={Hexagon}
          title="Node.js"
          version="22"
          sub="запускает JavaScript на сервере — без браузера"
          like="сама кухня: плита и свет"
          active={step === 0}
          aside={<Chip tone="success">node dist/main</Chip>}
          style={{ height: NODE.height }}
        />
      </Reveal>

      {/* 1 — NestJS */}
      <Reveal show={step >= 1} from="down" className="absolute" style={NEST}>
        <Layer
          tone="logic"
          icon={Boxes}
          title="NestJS"
          version="11"
          sub="каркас: у каждого кода своё место"
          like="распорядок: кто что делает"
          active={step === 1}
          style={{ height: NEST.height }}
        >
          <div className="mt-3 flex items-center gap-2.5">
            <Chip tone="ctrl">ItemsController</Chip>
            <ArrowRight size={20} className="text-muted" />
            <Chip tone="logic">CreateItemHandler</Chip>
          </div>
        </Layer>
      </Reveal>

      {/* 2 — PostgreSQL */}
      <Reveal show={step >= 2} from="left" className="absolute" style={PG}>
        <Layer
          tone="db"
          icon={Database}
          title="PostgreSQL"
          sub="база данных: всё хранится в таблицах"
          like="склад"
          active={step === 2}
          style={{ height: PG.height }}
        >
          <div className="mt-4 flex flex-col gap-2.5">
            {['Item', 'User', 'Order'].map((name) => (
              <div key={name} className="flex items-center gap-3 rounded-xl border-2 border-db/30 bg-db/10 px-4 py-2 font-mono text-[20px] font-semibold text-db">
                <Table2 size={22} />
                {name}
              </div>
            ))}
          </div>
        </Layer>
      </Reveal>

      {/* 3 — Prisma между кодом и базой */}
      <Reveal show={step >= 3} from="scale" className="absolute" style={PRISMA}>
        <Layer
          tone="prisma"
          icon={Triangle}
          title="Prisma"
          version="7"
          sub="переводит код ↔ SQL"
          like="кладовщик"
          active={step === 3}
          style={{ height: PRISMA.height }}
        >
          <div className="mt-3">
            <Chip tone="prisma">item.findMany()</Chip>
          </div>
        </Layer>
      </Reveal>
      <Arrow show={step >= 3} from={[PRISMA.left + PRISMA.width + 6, 160]} to={[PG.left - 8, 160]} tone={step === 3 ? 'prisma' : 'muted'} flow={step === 3} delay={0.3} />
      <Arrow show={step >= 3} from={[PG.left - 8, 226]} to={[PRISMA.left + PRISMA.width + 6, 226]} tone={step === 3 ? 'db' : 'muted'} flow={step === 3} delay={0.6} />

      <StepCaption
        step={step}
        tone="logic"
        captions={[
          'Node.js — запускает JavaScript на сервере',
          'NestJS — каркас: контроллеры и обработчики',
          'PostgreSQL — база данных с таблицами',
          'Prisma — переводчик между кодом и базой',
          'Docker — упаковка: так бэкенд едет на сервер',
        ]}
      />
    </SlideLayout>
  );
}
