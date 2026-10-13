# CLAUDE.md — библиотека анимированных презентаций для занятий

Next.js 14 (App Router) + React 18 + TypeScript + Tailwind 3 + framer-motion.
Главная — папки с презентациями; презентация — слайды для проектора с пошаговой анимацией.
Код на слайдах про бэкенд — из `../etalon-backend` (домен `items`), про фронт — из `../etalon-frontend`,
чтобы студенты узнавали то, что у них уже есть.

## Команды

- `npm run dev` — http://localhost:3002
- `npm run build` — статическая выгрузка в `out/` (`output: 'export'`). **Должна проходить**, вместе с ESLint.
  `npx tsc --noEmit` — быстрая проверка типов. Не запускать build при работающем dev — перезапишет `.next`.
- Деплой: GitHub Pages через `.github/workflows/pages.yml`, префикс адреса — `PAGES_BASE_PATH`.
  Поэтому пути только через `next/link`/router (они добавляют префикс сами); абсолютные `/…` в `src`, `href`,
  `history.replaceState` — нельзя.
- Презентация: `/p/<deck-id>`. Слайд: `#12.3` (слайд 12, шаг 3) или `#mig-runner.3` (по id). `?theme=dark` — тёмная тема.

## Управление на лекции

→ / Space / PageDown / клик — следующий шаг; ← / PageUp / клик в левой пятой — назад;
F — полный экран, B — чёрный экран, N — заметки лектора, O — оглавление, T — тема, Home/End.

## Структура

```
src/
  app/
    page.tsx           главная: папки и карточки презентаций
    p/[id]/page.tsx    презентация
    layout.tsx, globals.css (значения токенов)
  components/
    deck/              Deck (навигация, клавиши, переходы, шапка), Stage (1600×900), Progress, Notes, Overview
    library/           главная: папки, карточки, панель описания
    ui/                примитивы инфографики — см. ниже
  decks/
    index.ts           FOLDERS (папки) и DECKS (все презентации)
    <deck-id>/index.ts DeckDef: название, суть, темы, длительность + порядок слайдов
    <deck-id>/…        слайды; большая презентация — по подпапкам-разделам со своим index.ts
  lib/                 tones.ts (цвета слоёв), highlight.ts, motion.ts (EASE, SPRING, range), sections.ts (разделы)
  types/index.ts       DeckDef, FolderDef, SlideDef, SlideProps
```

## Как добавить презентацию

1. Папка `src/decks/<deck-id>/` + `index.ts` с `DeckDef` (образец — `what-is-backend/index.ts`).
2. Строка в `DECKS` (и при необходимости новая папка в `FOLDERS`) в `src/decks/index.ts`.
3. Нужен новый раздел (метка над заголовком) — ключ в `SectionKey` (types) и в `SECTIONS` (lib/sections.ts).

## Как устроен слайд

- Компонент `({ step }: SlideProps)`; `step` — от 0 до `steps-1`. Всё, что меняется по клику, — функция от `step`.
- Регистрация: объект `SlideDef` в массиве слайдов презентации: `id`, `section`, `title`, `steps`, `Component`, `notes`.
- Каркас: `<SlideLayout section="…" title={…}>`. Область контента — `relative`, **1440×640 px**
  (на сцене x=80, y≈198). Внутри можно позиционировать абсолютно: `className="absolute" style={{ left, top, width }}`.
  Низ области (~70 px) занимает `StepCaption`, если он есть.
- Заголовок — одна строка, ≤ ~40 символов. Код в заголовке — `<M>migrate:up</M>`.
- Назад на слайд = последний шаг: слайд обязан правильно рисоваться сразу на любом шаге (никаких эффектов,
  зависящих от истории кликов).

## Примитивы (`components/ui`)

| Компонент | Зачем |
|---|---|
| `Reveal show={step>=2} from="up\|left\|scale…" delay` | появление; место занято всегда — раскладка не прыгает |
| `Swap k={key}` | смена содержимого на месте (крест-фейд) |
| `NodeBox tone icon title sub state="idle\|active\|dim\|done\|error" size` | блок схемы (слой, база, файл) |
| `Arrow from={[x,y]} to={[x,y]} curve label flow tone show` | рисующаяся SVG-стрелка в координатах родителя |
| `FlowArrow length vertical label tone show` | короткая стрелка между элементами flex-ряда |
| `Packet at={[x,y]} tone` | «пакет данных», перелетает при смене `at` |
| `Code code lang hl={[3,4]} tone title size` | код с подсветкой строк (`range(3,6)` из lib/motion) |
| `Terminal lines={[{text, kind:'cmd'\|'out'\|'ok'\|'err'\|'dim'}]}` | терминал, прижат к низу |
| `DataTable title columns grid rows size` | строки БД; строки въезжают/схлопываются по `key` |
| `SchemaCard name columns state` | структура таблицы; колонки `state: 'new'\|'removed'\|'hl'\|'dim'` |
| `FileTree items` | дерево файлов, `state: 'hl'\|'new'\|'dim'\|'hidden'` |
| `Chip tone solid size` | моно-плашка: команда, статус, имя файла |
| `StepCaption step captions={[…]} tone` | крупная подпись «что сейчас происходит» внизу |
| `SlideLayout`, `M` | каркас слайда, инлайн-код |

## Цвета — только токены

- Один слой — один цвет на всех слайдах (`lib/tones.ts`): `client` браузер, `guard` guards, `ctrl` контроллер/роутинг,
  `logic` шина/хендлер, `prisma` Prisma, `db` PostgreSQL, `git` миграции. Плюс `success`/`warning`/`danger`/`accent`/`muted`.
- Динамические классы — **только** через `TONE[tone].text/bg/soft/border/...`, не `bg-${tone}` (JIT не увидит).
- Никаких `bg-white`, `text-gray-500`, hex в разметке. Панели кода тёмные в обеих темах (`bg-code-bg`).

## Проектор

- Минимум текста: подписи короткие, объясняет лектор (тезисы — в `notes`).
- Шрифты: заголовок 54, основной текст ≥ 24, код ≥ 19, мелкие подписи ≥ 15. Меньше — не читается с задних рядов.
- Анимация объясняет, а не украшает: движется то, о чём сейчас говорим, остальное приглушено (`dim`).

## Что легко сломать

- **`'use client'`** нужен в слайдах (framer-motion).
- **Шагов в `steps` меньше, чем использует слайд** → последние состояния недостижимы.
- **Несуществующие API** на слайдах. Код сверять с `../etalon-backend`; вывод команд — с реальным выводом утилит.
- Новые библиотеки не добавлять.
