import type { ComponentType } from 'react';
import { SlideAside } from '@/components/ui/slide-aside';
import type { SlideProps } from '@/types';
import { RoleBadge, type RoleKey } from './restaurant';

/**
 * Слайд из «Бэкенд изнутри» как есть + плашка работника ресторана в шапке.
 * Сам слайд не меняется: в исходной презентации он идёт без плашки.
 */
export function withRole(Slide: ComponentType<SlideProps>, role: RoleKey): ComponentType<SlideProps> {
  function RoleSlide(props: SlideProps) {
    return (
      <SlideAside value={<RoleBadge role={role} />}>
        <Slide {...props} />
      </SlideAside>
    );
  }
  RoleSlide.displayName = `withRole(${role})`;
  return RoleSlide;
}
