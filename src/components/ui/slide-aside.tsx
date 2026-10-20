'use client';

import { createContext, useContext } from 'react';

const Ctx = createContext<React.ReactNode>(null);

/**
 * Плашка справа от заголовка, заданная СНАРУЖИ слайда: одна и та же реализация слайда
 * в одной презентации идёт без плашки, в другой — с ней (так «Зал» и «Кухня» добавляют роль ресторана).
 */
export function SlideAside({ value, children }: { value: React.ReactNode; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSlideAside(): React.ReactNode {
  return useContext(Ctx);
}
