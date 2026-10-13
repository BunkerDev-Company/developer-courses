/** Общая кривая: быстрый старт, мягкая посадка. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Пружина для «летящих» объектов (пакет запроса, строки таблиц). */
export const SPRING = { type: 'spring', stiffness: 140, damping: 20 } as const;

/** Набор номеров строк: range(3, 6) → [3, 4, 5, 6]. Для подсветки кода. */
export function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
