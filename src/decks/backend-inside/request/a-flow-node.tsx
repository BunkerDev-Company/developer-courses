'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check, X } from 'lucide-react';
import type { NodeState } from '@/components/ui/node-box';
import { EASE } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

interface FlowNodeProps {
  tone: Tone;
  icon: LucideIcon;
  title: React.ReactNode;
  sub?: React.ReactNode;
  state?: NodeState;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Узкий блок схемы «иконка сверху, подпись снизу» — для длинных цепочек,
 * где NodeBox (иконка слева) не помещается по ширине.
 */
export function FlowNode({ tone, icon: Icon, title, sub, state = 'idle', className, style }: FlowNodeProps) {
  const t = TONE[tone];
  const active = state === 'active';

  return (
    <motion.div
      style={style}
      initial={false}
      animate={{ scale: active ? 1.06 : 1, opacity: state === 'dim' ? 0.35 : 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        'absolute flex flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-surface px-2 text-center shadow-card transition-[border-color,box-shadow,background-color] duration-300',
        active ? cn(t.border, t.ring) : 'border-border',
        state === 'done' && 'border-success/60',
        state === 'error' && 'border-danger bg-danger/5',
        className,
      )}
    >
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', t.soft, t.text)}>
        <Icon size={26} strokeWidth={2} />
      </div>
      <div className={cn('text-[22px] font-semibold leading-none', active && t.text)}>{title}</div>
      {sub && <div className="whitespace-nowrap font-mono text-[15px] leading-none text-text-2">{sub}</div>}

      {(state === 'done' || state === 'error') && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'absolute -right-2.5 -top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-card',
            state === 'done' ? 'bg-success' : 'bg-danger',
          )}
        >
          {state === 'done' ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
        </motion.div>
      )}
    </motion.div>
  );
}
