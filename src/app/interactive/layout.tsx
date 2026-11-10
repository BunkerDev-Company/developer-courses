import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Интерактив: бэкенд, культура, командная работа',
  description: 'Самостоятельная работа: три коротких блока с вопросами и кодом подтверждения для преподавателя.',
};

export default function InteractiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}

