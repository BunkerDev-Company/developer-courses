'use client';

import { useEffect, useRef, useState } from 'react';
import { STAGE_H, STAGE_W } from '@/lib/sections';
import type { SlideDef } from '@/types';

/** Живая миниатюра слайда: настоящий компонент, уменьшенный под ширину контейнера. */
export function SlideThumb({ slide }: { slide: SlideDef }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / STAGE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const Slide = slide.Component;

  return (
    <div
      ref={ref}
      className="pointer-events-none relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-bg"
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
      >
        <Slide step={slide.steps - 1} />
      </div>
    </div>
  );
}
