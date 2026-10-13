import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Шрифты скачиваются при сборке и раздаются локально — на лекции интернет не нужен.
const sans = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'cyrillic'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Бэкенд изнутри — миграции, Prisma, путь запроса',
  description: 'Анимированные слайды к лекции по etalon-backend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
