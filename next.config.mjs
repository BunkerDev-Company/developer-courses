/**
 * Сайт полностью статический: `npm run build` → папка out/ (HTML + JS + CSS).
 * Её можно положить на любой хостинг статики, у нас — GitHub Pages
 * (.github/workflows/pages.yml).
 *
 * PAGES_BASE_PATH — префикс адреса на GitHub Pages: сайт живёт не в корне домена,
 * а в /<имя-репозитория>. Workflow подставляет его сам; локально — пусто.
 */
const basePath = process.env.PAGES_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Только для build: next dev 14 с output: 'export' падает на /p/[id]
  // («missing generateStaticParams»), хотя функция есть и build с ней проходит.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // /p/backend-inside/ → p/backend-inside/index.html — так GitHub Pages находит страницы.
  trailingSlash: true,
  basePath,
};

export default nextConfig;
