'use client';

import type { SlideProps } from '@/types';
import { RequestTitle } from '../request/title-slide';

export function HallTitleSlide(_: SlideProps) {
  return (
    <RequestTitle
      part={1}
      title="Зал"
      subtitle="как бэкенд принимает запрос"
      roles={[
        { role: 'guard', text: 'кто ты и можно ли тебе сюда' },
        { role: 'host', text: 'какой метод вызвать по адресу' },
        { role: 'waiter', text: 'принять заказ и выписать чек' },
      ]}
    />
  );
}
