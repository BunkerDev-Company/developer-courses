import type { Config } from 'tailwindcss';

/**
 * Дизайн-токены. Значения — в CSS-переменных (src/app/globals.css), чтобы
 * светлая/тёмная тема переключалась одной клавишей T без пересборки.
 * В разметке пишем `bg-surface`, `text-text-2`, `border-guard/40`, а не hex.
 *
 * Цвета слоёв бэкенда — сквозные для всех слайдов: один слой = один цвет
 * (guard всегда янтарный, prisma всегда бирюзовая и т.д.).
 */
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── Фоны и текст ─────────────────────────────────────────────
        bg:          token('bg'),
        surface:     token('surface'),
        'surface-2': token('surface-2'),
        'surface-3': token('surface-3'),
        border:      token('border'),
        'border-2':  token('border-2'),
        text:        token('text'),
        'text-2':    token('text-2'),
        muted:       token('muted'),
        accent:      token('accent'),

        // ── Статусы ──────────────────────────────────────────────────
        success: token('success'),
        warning: token('warning'),
        danger:  token('danger'),

        // ── Слои бэкенда ─────────────────────────────────────────────
        client: token('client'),   // браузер / фронт
        guard:  token('guard'),    // JwtAuthGuard, RolesGuard
        ctrl:   token('ctrl'),     // контроллер, роутинг
        logic:  token('logic'),    // шина, хендлер
        prisma: token('prisma'),   // Prisma, schema.prisma
        db:     token('db'),       // PostgreSQL
        git:    token('git'),      // миграции, гит

        // ── Подсветка кода (панель кода тёмная в обеих темах) ─────────
        code: {
          bg:      token('code-bg'),
          line:    token('code-line'),
          text:    token('code-text'),
          keyword: token('code-keyword'),
          string:  token('code-string'),
          comment: token('code-comment'),
          fn:      token('code-fn'),
          type:    token('code-type'),
          number:  token('code-number'),
          deco:    token('code-deco'),
          prop:    token('code-prop'),
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--c-shadow) / 0.06), 0 2px 8px rgb(var(--c-shadow) / 0.06)',
        lift: '0 12px 32px rgb(var(--c-shadow) / 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
