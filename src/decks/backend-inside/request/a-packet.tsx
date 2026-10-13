'use client';

import { motion } from 'framer-motion';
import { Swap } from '@/components/ui/reveal';
import { SPRING } from '@/lib/motion';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

interface InfoPacketProps {
  /** Центр пакета в координатах родителя. Меняется → пакет летит. */
  at: readonly [number, number];
  tone: Tone;
  /** Ключ содержимого: сменился — содержимое меняется крест-фейдом. */
  k: string | number;
  /** Подпись над содержимым: «тело JSON», «SQL»… */
  label: React.ReactNode;
  /** Строки моноширинного содержимого. */
  lines: string[];
  show?: boolean;
}

/**
 * «Пакет» с подписью и многострочным содержимым: летит между блоками схемы,
 * а по дороге меняет форму (JSON → DTO → команда → SQL → строка → конверт).
 */
export function InfoPacket({ at, tone, k, label, lines, show = true }: InfoPacketProps) {
  const t = TONE[tone];
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-20"
      initial={false}
      animate={{ x: at[0], y: at[1], opacity: show ? 1 : 0 }}
      transition={{ ...SPRING, opacity: { duration: 0.25 } }}
    >
      <div
        className={cn(
          '-translate-x-1/2 -translate-y-1/2 rounded-xl border-2 bg-surface px-4 py-2.5 shadow-lift transition-colors duration-300',
          t.border,
        )}
      >
        <Swap k={k}>
          <div className={cn('mb-1 whitespace-nowrap text-[16px] font-semibold', t.text)}>{label}</div>
          <div className="whitespace-pre font-mono text-[20px] font-semibold leading-[1.35] text-text">{lines.join('\n')}</div>
        </Swap>
      </div>
    </motion.div>
  );
}
