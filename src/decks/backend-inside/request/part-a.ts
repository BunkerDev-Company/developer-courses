import type { SlideDef } from '@/types';
import { BusSlide } from './bus-slide';
import { ControllerSlide } from './controller-slide';
import { GuardsSlide } from './guards-slide';
import { HttpSlide } from './http-slide';
import { OverviewSlide } from './overview-slide';
import { RoutingSlide } from './routing-slide';

/** Первая половина раздела: от HTTP до шины команд. */
export const requestSlidesA: SlideDef[] = [
  {
    id: 'req-http',
    section: 'request',
    title: 'Что прилетает на бэкенд',
    steps: 4,
    Component: HttpSlide,
    notes: [
      'Шаг 0: на фронте это вызов функции, но по сети летит обычный текст. axios сам дописывает baseURL (…/api/v1) и заголовок Authorization с токеном из cookie app_token.',
      'Шаг 1: первая строка — метод и путь. Это адрес: по нему Nest выберет метод контроллера.',
      'Шаг 2: Authorization — пропуск. Его проверят guards ещё до контроллера.',
      'Шаг 3: тело — данные. Спросить: «а где тут userId?» — его нет в теле, он внутри токена (дальше увидим).',
    ],
  },
  {
    id: 'req-overview',
    section: 'request',
    title: 'Путь запроса целиком',
    steps: 10,
    Component: OverviewSlide,
    notes: [
      'Это карта раздела: дальше каждый блок разберём крупно. Следите за пакетом — он меняет форму на каждом слое.',
      'Шаги 1–3: guards только проверяют, контроллер только упаковывает. Логики там нет.',
      'Шаги 4–6: вся работа — в хендлере; Prisma пишет SQL за нас; база возвращает строку как есть (snake_case, Decimal).',
      'Шаги 7–9: presentItem вызывается в конце хендлера; конверт { data, … } добавляет интерцептор — хендлер его не пишет. Вопрос: кто из блоков знает про HTTP? (guards, контроллер, интерцептор).',
    ],
  },
  {
    id: 'req-routing',
    section: 'request',
    title: 'Как Nest находит метод',
    steps: 4,
    Component: RoutingSlide,
    notes: [
      'Шаг 0: /api/v1 нигде в контроллерах не пишем — это setGlobalPrefix в main.ts (кроме health-check «/»).',
      "Шаг 1: @Controller('items') — префикс для всех методов класса.",
      'Шаг 2: HTTP-метод выбирает декоратор: POST → @Post(). Имя функции create — любое, Nest его не читает.',
      'Шаг 3: :id — переменная часть пути. ParseUUIDPipe отклонит «abc» с 400 ещё до вызова метода.',
    ],
  },
  {
    id: 'req-guards',
    section: 'request',
    title: 'Guards: охрана на входе',
    steps: 4,
    Component: GuardsSlide,
    notes: [
      'Шаг 0: JwtAuthGuard — «есть пропуск?». Нет заголовка Bearer → 401, code 1. Фронт по 401 разлогинивает.',
      'Шаг 1: токен валиден → guard кладёт userId и userRole в request. RolesGuard сверяет роль с @Roles → 403, code 41.',
      'Шаг 2: порядок важен: RolesGuard читает userRole, который положил JwtAuthGuard. Поэтому JwtAuthGuard первый.',
      'Шаг 3: guards в проекте не глобальные. @Roles без @UseGuards — метка, которую никто не читает: зайдёт кто угодно.',
    ],
  },
  {
    id: 'req-controller',
    section: 'request',
    title: 'Контроллер: принял → упаковал → отдал',
    steps: 4,
    Component: ControllerSlide,
    notes: [
      'Шаг 0: userId не из тела, а из токена — его положил JwtAuthGuard. Клиент не может подделать userId.',
      'Шаг 1: @Body() — тело как есть; CreateItemDto implements CreateItemInput, расхождение полей поймает компилятор.',
      'Шаг 2: команда — класс только с полями, без логики. «Коробка» с данными.',
      'Шаг 3: контроллер в 3 строки. Вопрос: где проверка цены? — в хендлере (validate), не здесь.',
    ],
  },
  {
    id: 'req-bus',
    section: 'request',
    title: 'CommandBus: кто обработает команду',
    steps: 4,
    Component: BusSlide,
    notes: [
      'Шаг 0: шина — это словарь «класс команды → хендлер» плюс вызов execute. Никакой магии.',
      'Шаг 1: словарь собирается при старте: @CommandHandler говорит «на какую команду», массив в app.module.ts — «какие классы создать». Автообнаружения нет.',
      'Шаг 2: забыли строку в массиве — TypeScript доволен, приложение стартует, а падает только живой запрос: 500, code 99 и запись в ErrorLog. Спросить: как такое поймать до пары? (e2e-тест на эндпоинт).',
      'Шаг 3: «команды меняют, запросы читают, у каждой один обработчик». Хочешь понять систему — читай имена файлов в handlers/.',
    ],
  },
];
