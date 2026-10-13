import { SECTIONS } from '@/lib/sections';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SectionKey } from '@/types';

interface Props {
  section: SectionKey;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Каркас слайда: метка раздела + заголовок + область контента.
 * Область контента — `relative`, ~1440×640 px (x=80, y≈192 на сцене),
 * внутри неё можно позиционировать абсолютно.
 */
export function SlideLayout({ section, title, children, className }: Props) {
  const s = SECTIONS[section];
  const tone = TONE[s.tone];

  return (
    <div className="flex h-full flex-col px-20 pb-16 pt-14">
      <header className="mb-10 shrink-0">
        <div className={cn('eyebrow flex items-center gap-3', tone.text)}>
          <span className={cn('h-3 w-3 rounded-full', tone.bg)} />
          {s.label}
        </div>
        <h1 className="mt-3 text-[54px] font-bold leading-[1.1] tracking-tight">{title}</h1>
      </header>
      <div className={cn('relative min-h-0 flex-1', className)}>{children}</div>
    </div>
  );
}

/** Код внутри обычного текста: заголовков, подписей. */
export function M({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        'rounded-lg bg-surface-3/80 px-[0.3em] py-[0.05em] font-mono text-[0.86em] font-semibold',
        className,
      )}
    >
      {children}
    </code>
  );
}
