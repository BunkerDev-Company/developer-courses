import type { SlideDef } from '@/types';
import { requestSlidesA } from './part-a';
import { requestSlidesB } from './part-b';

export const requestSlides: SlideDef[] = [...requestSlidesA, ...requestSlidesB];
