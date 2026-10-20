'use client';

import type { SlideProps } from '@/types';
import { RequestTitle } from '../request/title-slide';

export function KitchenTitleSlide(_: SlideProps) {
  return (
    <RequestTitle
      part={2}
      title="Кухня"
      subtitle="где живёт логика бэкенда"
      roles={[
        { role: 'pass', text: 'какому повару отдать чек' },
        { role: 'cook', text: 'вся логика: проверить и приготовить' },
        { role: 'tools', text: 'база, ошибки, уведомления' },
        { role: 'plate', text: 'в каком виде отдать гостю' },
      ]}
    />
  );
}
