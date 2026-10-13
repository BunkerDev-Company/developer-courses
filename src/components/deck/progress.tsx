'use client';

import { SECTIONS } from '@/lib/sections';
import { TONE } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { SlideDef } from '@/types';

interface Props {
  slides: SlideDef[];
  slide: number;
  step: number;
}

/** Тонкая полоса прогресса по разделам + номер слайда и точки шагов. */
export function Progress({ slides, slide, step }: Props) {
  const current = slides[slide];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0">
      <div className="flex items-center justify-end gap-4 px-8 pb-3 text-[16px] font-medium text-muted">
        {current.steps > 1 && (
          <div className="flex gap-1.5">
            {Array.from({ length: current.steps }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors duration-300',
                  i <= step ? TONE[SECTIONS[current.section].tone].bg : 'bg-border-2',
                )}
              />
            ))}
          </div>
        )}
        <span className="tabular-nums">
          {slide + 1} / {slides.length}
        </span>
      </div>
      <div className="flex h-1.5 gap-[3px]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              'flex-1 transition-colors duration-300',
              i <= slide ? TONE[SECTIONS[s.section].tone].bg : 'bg-border',
              i === slide && 'opacity-100',
              i < slide && 'opacity-50',
            )}
          />
        ))}
      </div>
    </div>
  );
}
