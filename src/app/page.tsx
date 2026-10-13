'use client';

import { Library } from '@/components/library/library';

// Клиентская страница: превью слайдов — компоненты, через границу server→client их не передать.
export default function Page() {
  return <Library />;
}
