import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Склейка классов с разрешением конфликтов Tailwind: cn('px-2', cond && 'px-4'). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
