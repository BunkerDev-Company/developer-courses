import type { LucideIcon } from 'lucide-react';
import { TONE, type Tone } from '@/lib/tones';
import { cn } from '@/lib/utils';

interface ChipProps {
  tone?: Tone;
  icon?: LucideIcon;
  /** solid — залитый фон тона, белый текст. */
  solid?: boolean;
  /** sm — для строк таблиц, чтобы не раздувать высоту строки. */
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

/** Моно-плашка: команда, имя файла, HTTP-статус. */
export function Chip({ tone = 'muted', icon: Icon, solid, size = 'md', className, children }: ChipProps) {
  const t = TONE[tone];
  return (
    <span
      className={cn(
        'chip',
        size === 'sm' && 'rounded-lg px-2 py-0.5 text-[15px]',
        solid ? cn(t.bg, t.border, 'text-white') : cn(t.soft, t.borderSoft, t.text),
        className,
      )}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 20} strokeWidth={2.25} />}
      {children}
    </span>
  );
}
