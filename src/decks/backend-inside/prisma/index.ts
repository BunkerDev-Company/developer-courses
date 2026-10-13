import type { SlideDef } from '@/types';
import { FlowSlide } from './flow-slide';
import { GenerateSlide } from './generate-slide';
import { PullSlide } from './pull-slide';
import { QueriesSlide } from './queries-slide';
import { VsSlide } from './vs-slide';
import { WhatSlide } from './what-slide';

export const prismaSlides: SlideDef[] = [
  {
    id: 'prisma-what',
    section: 'prisma',
    title: 'Prisma — переводчик с TS на SQL',
    steps: 4,
    Component: WhatSlide,
    notes: [
      'Шаг 0: это настоящий код из ListItemsHandler. Вопрос залу: где здесь SQL? — Нигде. База понимает только SQL.',
      'Шаг 1: Prisma строит SQL сама. where → WHERE, orderBy → ORDER BY, skip/take → OFFSET/LIMIT. Значения уходят отдельно ($1, $2…) — это защита от SQL-инъекций.',
      'Шаг 2: PostgreSQL ничего не знает про Prisma — он просто выполнил обычный SELECT.',
      'Шаг 3: обратно приходят строки, Prisma превращает их в объекты. TypeScript знает, что это Item[], — откуда он это знает, следующий слайд.',
    ],
  },
  {
    id: 'prisma-flow',
    section: 'prisma',
    title: 'Откуда Prisma знает про таблицы',
    steps: 5,
    Component: FlowSlide,
    notes: [
      'Сквозной пример — та самая миграция add-item-category из прошлого раздела. Следим, как одна колонка проходит весь конвейер.',
      'Шаги 1–2: после migrate:up колонка есть в базе, но код про неё ещё не знает. Вопрос залу: что будет, если сразу написать item.category? — Ошибка типов: schema.prisma старая.',
      'Шаг 2: db pull подключается к живой базе, читает структуру таблиц и ПЕРЕЗАПИСЫВАЕТ schema.prisma целиком.',
      'Шаг 3: generate по schema.prisma генерирует клиент и типы в node_modules. Их мы не коммитим и не правим.',
      'Шаг 4: направление одно — база → схема → типы. На практике: migrate:up, затем npm run prisma:pull (это db pull + generate).',
    ],
  },
  {
    id: 'prisma-pull',
    section: 'prisma',
    title: 'db pull: таблица → модель',
    steps: 6,
    Component: PullSlide,
    notes: [
      'Слева — настоящий CREATE TABLE из initial-schema-up.sql, справа — то, что из него сделал db pull (src/infrastructure/prisma/schema.prisma). Строки сокращены, суть та же.',
      'Шаг 1: в TypeScript нет типа UUID — это просто строка. @db.Uuid помнит настоящий тип в базе, а dbgenerated — что значение придумывает сама база.',
      'Шаг 2: главный вопрос залу — почему у description знак вопроса, а у title нет? Ответ: у title NOT NULL. В коде description придётся проверять на null.',
      'Шаг 3–4: Decimal — не number, поэтому presenter переводит его в число. FOREIGN KEY → поле User: через него Prisma умеет подтягивать автора (include).',
      'Шаг 5: любая ручная правка schema.prisma исчезнет при следующем pull. Хотим изменить схему — пишем новую миграцию.',
    ],
  },
  {
    id: 'prisma-generate',
    section: 'prisma',
    title: 'generate: модель → типы → подсказки',
    steps: 4,
    Component: GenerateSlide,
    notes: [
      'Шаг 0: из одной модели Item генерируется пачка типов. Item — что приходит из базы, ItemCreateInput — что можно передать в create (id и price необязательны: у них DEFAULT в базе).',
      'Шаг 1: this.prisma.item — это сгенерированный ItemDelegate, поэтому редактор знает все 18 методов. Никто их руками не писал.',
      'Шаг 2: внутри data редактор подсказывает только существующие колонки — из ItemCreateInput.',
      'Шаг 3: опечатка titel. Вопрос залу: когда бы мы узнали про неё без типов? — Только при запросе, на проде. Здесь — сразу, красным, и npm run build тоже упадёт.',
    ],
  },
  {
    id: 'prisma-vs',
    section: 'prisma',
    title: 'В туториалах — наоборот',
    steps: 5,
    Component: VsSlide,
    notes: [
      'Шаг 0: почти все туториалы по Prisma показывают этот путь — пишешь schema.prisma, prisma migrate dev сам генерирует SQL и применяет. Студенты, скорее всего, видели именно его.',
      'Шаг 1–2: у нас стрелки идут в другую сторону. Источник правды — SQL-миграции, schema.prisma — производная от базы. Вопрос залу: какой файл у нас нельзя править руками? — schema.prisma.',
      'Шаг 3: зачем: частичный индекс по email, CHECK на роль и цену, бэкфиллы (UPDATE в миграции) — это пишется на SQL. Prisma сама честно пишет над model User, что CHECK требует «additional setup».',
      'Шаг 4: prisma migrate dev ищет свою историю (_prisma_migrations и папку prisma/migrations), не находит, видит расхождение и предлагает reset — то есть снести все таблицы с данными. У нас эта команда запрещена.',
    ],
  },
  {
    id: 'prisma-queries',
    section: 'prisma',
    title: 'Методы Prisma ↔ SQL',
    steps: 6,
    Component: QueriesSlide,
    notes: [
      'Каждый метод — это один SQL-запрос (или несколько в транзакции). Код слева — из наших item-*.handler.ts.',
      'findMany с contains + mode: insensitive превращается в ILIKE с %…% — поиск без учёта регистра. findUnique — поиск по ключу, максимум одна строка.',
      'create/update отдают строку целиком благодаря RETURNING — отдельный SELECT не нужен. deleteMany не бросает ошибку, если строки нет: возвращает count, и мы сами кидаем ITEM_NOT_FOUND.',
      '$transaction: count и страница выполняются в одной транзакции, чтобы total совпадал с items. Упадёт любой запрос — ROLLBACK, в базе ничего не поменяется.',
    ],
  },
];
