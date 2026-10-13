'use client';

import { useEffect, useState } from 'react';
import { STAGE_H, STAGE_W } from '@/lib/sections';

/**
 * Сцена фиксированного размера 1600×900, вписанная в окно с сохранением 16:9.
 * Внутри слайдов координаты абсолютные и не зависят от экрана проектора.
 */
export function Stage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () =>
      setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      className="absolute left-1/2 top-1/2 overflow-hidden bg-bg"
      style={{
        width: STAGE_W,
        height: STAGE_H,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}
