'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

type Pt = readonly [number, number];

interface ArrowProps {
  /** Координаты в пикселях относительно ближайшего `relative`-контейнера. */
  from: Pt;
  to: Pt;
  show?: boolean;
  tone?: Tone;
  /** Изгиб: смещение контрольной точки перпендикулярно линии (px, может быть < 0). */
  curve?: number;
  /** Подпись в середине стрелки (обычно команда: `migrate:up`). */
  label?: React.ReactNode;
  /** Сдвиг подписи от середины: [dx, dy]. */
  labelOffset?: Pt;
  dashed?: boolean;
  /** Бегущие штрихи поверх линии — «данные текут». */
  flow?: boolean;
  delay?: number;
  width?: number;
}

/** Стрелка, которая «рисуется» при появлении. */
export function Arrow({
  from,
  to,
  show = true,
  tone = 'muted',
  curve = 0,
  label,
  labelOffset = [0, 0],
  dashed,
  flow,
  delay = 0,
  width = 4,
}: ArrowProps) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  // Контрольная точка — перпендикуляр от середины.
  const cx = mx + (-(y2 - y1) / len) * curve;
  const cy = my + ((x2 - x1) / len) * curve;
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

  // Наконечник смотрит по касательной в конце кривой.
  const angle = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
  const head = width * 3.4;
  const t = TONE[tone];
  // Середина квадратичной кривой (t = 0.5).
  const lx = 0.25 * x1 + 0.5 * cx + 0.25 * x2 + labelOffset[0];
  const ly = 0.25 * y1 + 0.5 * cy + 0.25 * y2 + labelOffset[1];

  return (
    <>
      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
        <motion.path
          d={d}
          fill="none"
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={dashed ? '2 12' : undefined}
          className={t.stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={show ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: show ? delay : 0, ease: EASE }}
        />
        {flow && (
          <motion.path
            d={d}
            fill="none"
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray="1 18"
            className="stroke-surface"
            initial={{ opacity: 0, strokeDashoffset: 0 }}
            animate={{ opacity: show ? 0.9 : 0, strokeDashoffset: -38 }}
            transition={{
              opacity: { duration: 0.3, delay: show ? delay + 0.6 : 0 },
              strokeDashoffset: { duration: 0.9, repeat: Infinity, ease: 'linear' },
            }}
          />
        )}
        <motion.polygon
          points={`0,0 ${-head},${-head * 0.6} ${-head},${head * 0.6}`}
          className={t.fill}
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.2, delay: show ? delay + 0.45 : 0 }}
          transform={`translate(${x2} ${y2}) rotate(${angle})`}
        />
      </svg>
      {label && (
        <motion.div
          className="pointer-events-none absolute left-0 top-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0, x: lx, y: ly }}
          transition={{ duration: 0.35, delay: show ? delay + 0.3 : 0 }}
        >
          <div className={cn('chip -translate-x-1/2 -translate-y-1/2 bg-surface shadow-card', t.borderSoft, t.text)}>
            {label}
          </div>
        </motion.div>
      )}
    </>
  );
}

interface FlowArrowProps {
  show?: boolean;
  tone?: Tone;
  /** Длина в px. */
  length?: number;
  vertical?: boolean;
  label?: React.ReactNode;
  delay?: number;
  className?: string;
}

/** Короткая прямая стрелка для flex-раскладок: [A] → [B]. */
export function FlowArrow({ show = true, tone = 'muted', length = 72, vertical, label, delay = 0, className }: FlowArrowProps) {
  const t = TONE[tone];
  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center', vertical ? 'flex-col' : '', className)}
      style={vertical ? { height: length } : { width: length }}
    >
      <motion.div
        className={cn('rounded-full', t.bg, vertical ? 'w-1 origin-top' : 'h-1 origin-left')}
        style={vertical ? { height: length - 14 } : { width: length - 14 }}
        initial={vertical ? { scaleY: 0 } : { scaleX: 0 }}
        animate={vertical ? { scaleY: show ? 1 : 0 } : { scaleX: show ? 1 : 0 }}
        transition={{ duration: 0.4, delay: show ? delay : 0, ease: EASE }}
      />
      <motion.div
        className={cn(
          'h-0 w-0 border-transparent',
          vertical
            ? 'border-x-[9px] border-t-[14px] border-x-transparent'
            : 'border-y-[9px] border-l-[14px] border-y-transparent',
        )}
        style={vertical ? { borderTopColor: `rgb(var(--c-${toneVar(tone)}))` } : { borderLeftColor: `rgb(var(--c-${toneVar(tone)}))` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.2, delay: show ? delay + 0.3 : 0 }}
      />
      {label && (
        <motion.div
          className={cn(
            'absolute whitespace-nowrap font-mono text-[16px] font-medium',
            t.text,
            vertical ? 'left-full ml-3' : 'bottom-full mb-2',
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.3, delay: show ? delay + 0.2 : 0 }}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
}

/** Имя CSS-переменной тона: у muted своей нет — берём border-2. */
function toneVar(tone: Tone): string {
  return tone === 'muted' ? 'border-2' : tone;
}
