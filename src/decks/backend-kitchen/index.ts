import { ChefHat } from 'lucide-react';
import type { DeckDef, SlideDef } from '@/types';
import { BusSlide } from '../backend-inside/request/bus-slide';
import { DiSlide } from '../backend-inside/request/di-slide';
import { ErrorsSlide } from '../backend-inside/request/errors-slide';
import { RecipeSlide as FieldRecipeSlide } from '../backend-inside/outro/recipe-slide';
import { HandlerSlide } from '../backend-inside/request/handler-slide';
import { InterceptorSlide } from '../backend-inside/request/interceptor-slide';
import { LayersSlide } from '../backend-inside/request/layers-slide';
import { KitchenMapSlide } from './map-slide';
import { OverviewSlide } from '../backend-inside/request/overview-slide';
import { PresenterSlide } from '../backend-inside/request/presenter-slide';
import { KitchenQuizSlide } from './quiz-slide';
import { RecipeSlide } from './recipe-slide';
import { ServicesSlide } from './services-slide';
import { TicketSlide } from './ticket-slide';
import { KitchenTitleSlide } from './title-slide';
import { WhyBusSlide } from './why-bus-slide';
import { withRole } from '../request/with-role';

/** Порядок лекции: чек → раздача → техника → повар → тарелка → поднос → жалобы → весь путь целиком. */
const slides: SlideDef[] = [
  {
    id: 'kit-title',
    section: 'intro',
    title: 'Кухня',
    steps: 1,
    Component: KitchenTitleSlide,
    notes: [
      'Вторая половина пути запроса. В прошлый раз — зал: охранник, хостес, официант. Сегодня — что происходит с чеком на кухне.',
      'Пример тот же: админ создаёт товар «Наушники», POST /api/v1/items.',
    ],
  },
  {
    id: 'kit-map',
    section: 'intro',
    title: 'Ресторан: где остановились',
    steps: 3,
    Component: KitchenMapSlide,
    notes: [
      'Шаг 0: вся карта с двойниками NestJS. Попросить зал назвать двойника каждого работника, не глядя на подписи.',
      'Шаг 1: зал разобрали. Итог прошлого раза одной фразой: официант ничего не готовит — он выписывает чек и отдаёт его.',
      'Шаг 2: сегодня правая половина. Плашка в шапке каждого слайда — кто сейчас работает.',
    ],
  },
  {
    id: 'kit-ticket',
    section: 'request',
    title: 'Команда — это чек',
    steps: 3,
    Component: TicketSlide,
    notes: [
      'Шаг 0: чек официанта и класс CreateItemCommand устроены одинаково: кто заказал (creatorUserId из токена) и что (data из тела).',
      'Шаг 1: в чеке нет рецепта. У команды нет методов, проверок и Prisma — только поля. Рецепт знает повар (хендлер).',
      'Шаг 2: прочитайте имена файлов в commands/ и queries/ — это меню бэкенда. Заказ что-то меняет (POST, PATCH, DELETE) и идёт через CommandBus, вопрос только читает (GET) и идёт через QueryBus.',
    ],
  },
  {
    id: 'kit-why-bus',
    section: 'request',
    title: 'Зачем шина',
    steps: 3,
    Component: WhyBusSlide,
    notes: [
      'Шаг 0: честно — так тоже работает. Хендлеры — обычные провайдеры, их можно получить в конструктор контроллера и вызвать execute напрямую. Но контроллер знает всех поваров по именам, и с каждым новым действием конструктор растёт.',
      'Шаг 1: в etalon контроллер знает только CommandBus и QueryBus. Повесил чек — кто готовит, решает кухня.',
      'Шаг 2: выигрыш — официант не зависит от поваров: переписали или заменили хендлер, контроллер не тронули. Цена — каждого повара надо записать на раздаче. Это следующий слайд.',
    ],
  },
  {
    id: 'req-bus',
    section: 'request',
    title: 'CommandBus: кто обработает команду',
    steps: 4,
    Component: withRole(BusSlide, 'pass'),
    notes: [
      'Шаг 0: раздача — это словарь «класс команды → хендлер» плюс вызов execute. Никакой магии.',
      'Шаг 1: словарь собирается при старте — как таблица маршрутов в прошлый раз: @CommandHandler — наклейка «на какой чек», массив в app.module.ts — «каких поваров создать». Автообнаружения нет.',
      'Шаг 2: забыли строку в массиве — TypeScript доволен, приложение стартует, а падает только живой запрос: 500, code 99 и запись в ErrorLog. Спросить: как такое поймать до пары? (e2e-тест на эндпоинт).',
      'Шаг 3: «команды меняют, запросы читают, у каждой один обработчик». Хочешь понять систему — читай имена файлов в handlers/.',
    ],
  },
  {
    id: 'kit-services',
    section: 'request',
    title: 'Сервисы — общая техника',
    steps: 4,
    Component: ServicesSlide,
    notes: [
      'Шаг 0: сервис — обычный класс с @Injectable(), записанный в providers app.module. В etalon их три: PrismaService (дверь на склад), ErrorService (журнал жалоб), NotificationService (колокольчик, сейчас fake — только лог).',
      'Шаг 1: плиту не приносит каждый повар — она одна на кухне. PrismaService создан один раз, им пользуются все хендлеры.',
      'Шаг 2: сервис может пользоваться другим сервисом: ErrorService.log() пишет в таблицу ErrorLog через PrismaService. GlobalExceptionFilter (менеджер) тоже берёт ErrorService.',
      'Шаг 3: главное правило. Если код про правила магазина — в хендлер. Если про «как технически» (база, письмо, файл) — в сервис. Спросить: куда положить «скидка 10% по пятницам»? (хендлер) А «отправить письмо через SMTP»? (сервис)',
    ],
  },
  {
    id: 'req-di',
    section: 'request',
    title: 'DI: откуда у хендлера prisma',
    steps: 4,
    Component: withRole(DiSlide, 'tools'),
    notes: [
      'Шаг 0: повар не покупает себе плиту. В хендлере нет ни одного new — он только перечисляет в конструкторе, что ему нужно, типами. Спросить: «а кто тогда создал prisma?»',
      'Шаги 1–2: при старте Nest смотрит на типы параметров, находит готовые объекты в контейнере (их список — providers в app.module.ts) и сам вызывает new CreateItemHandler(prisma, errors, notifications). Как с create() у контроллера: мы описываем, Nest вызывает.',
      'Шаг 3: PrismaService создан один раз — у всего приложения один пул подключений к базе. Если бы каждый хендлер делал new PrismaClient(), подключений было бы десятки.',
      'Там же: в тесте вместо настоящего PrismaService подсовывают фейк ({ provide, useValue }) — код хендлера не меняется. Забыли добавить класс в providers → Nest при старте скажет «can\'t resolve dependencies» (будет в игре в конце).',
    ],
  },
  {
    id: 'req-handler',
    section: 'request',
    title: 'Handler: вся логика здесь',
    steps: 5,
    Component: withRole(HandlerSlide, 'cook'),
    notes: [
      'Шаг 0: раздача вызвала execute(command). Первым делом повар проверяет продукты: пустой title → errors.throw, и дальше хендлер не идёт (что будет с ошибкой — через пару слайдов).',
      'Шаг 1: ключевой момент — имена. В API camelCase (imageUrl), в базе snake_case (image_url). Переводит хендлер, явно, руками. created_by берём не из тела запроса, а из команды — это id из токена. Спросить: почему не из тела?',
      'Шаг 2: Prisma возвращает строку целиком — с полями, которые поставила база: id, даты. price — Decimal, а не number.',
      'Шаги 3–4: уведомление — побочный эффект, его сбой не ломает создание (NotificationService глотает ошибку). Возвращаем не строку БД, а presentItem(item) — следующий слайд.',
    ],
  },
  {
    id: 'req-presenter',
    section: 'request',
    title: 'Presenter: строка БД → ответ API',
    steps: 4,
    Component: withRole(PresenterSlide, 'plate'),
    notes: [
      'Повар не отдаёт кастрюлю — выкладывает порцию на тарелку. presentItem — обычная функция: берёт строку из базы и собирает объект для ответа. Поле за полем.',
      'Шаги 1–2: фронт живёт в camelCase и числах. В базе — snake_case и Decimal (точные деньги). Переводим в одном месте — здесь.',
      'Шаг 3: наружу уходит только то, что перечислено. created_by не нужен клиенту. У User так же: password_hash не отдаём никогда — спросить, что будет, если вернуть строку Prisma как есть.',
      'Один presenter на ресурс: list, get, create, update зовут один presentItem — фронт везде получает одинаковый Item и один тип в TypeScript.',
    ],
  },
  {
    id: 'req-interceptor',
    section: 'request',
    title: 'Interceptor: конверт ответа',
    steps: 4,
    Component: withRole(InterceptorSlide, 'tray'),
    notes: [
      'Шаг 0: хендлер возвращает только товар. Про responseTime, версию и прочее он ничего не знает — и не должен. Поднос одинаковый для любого блюда.',
      'Шаг 1: ResponseInterceptor (подключён в main.ts через useGlobalInterceptors) заворачивает ЛЮБОЙ успешный ответ в одинаковый конверт: data + служебные поля. BigIntInterceptor — второй, превращает BigInt в строку (JSON его не умеет); у нас id — UUID, так что тут он ничего не меняет.',
      'Шаг 2: по сети уходит 201 Created (Nest ставит 201 для @Post по умолчанию) и конверт целиком. Можно показать во вкладке Network.',
      'Шаг 3: на фронте axios-интерсептор в lib/api.ts раскрывает .data ровно один раз для всех запросов. Поэтому в коде компонентов и в itemsApi никогда не пишем res.data.data. Спросить: что сломается, если раскрыть ещё раз?',
    ],
  },
  {
    id: 'req-errors',
    section: 'request',
    title: 'Ошибка на любом шаге',
    steps: 5,
    Component: withRole(ErrorsSlide, 'manager'),
    notes: [
      'Шаги 0–1: повар не выбегает в зал кричать — он бросает исключение: errors.throw(\'VALIDATION\', \'Название обязательно\'). С этого места код дальше не идёт — Prisma, presenter, ResponseInterceptor пропущены.',
      'Шаг 2: исключение ловит GlobalExceptionFilter (менеджер) и отвечает гостю своим конвертом: code и message — из каталога app-errors.ts (VALIDATION = 5, 400), details — наш текст для человека. Фронт ветвится по code, а не по тексту.',
      'Шаг 3: axios-интерсептор подменяет message на details, apiError(e) отдаёт его в toast.error — пользователь видит «Название обязательно» без единого if в компоненте.',
      'Шаг 4: непредвиденное (здесь — забыли migrate:up, Prisma не нашла колонку) → 500, code 99, details: null, наружу подробностей не даём, а сама ошибка со стеком пишется в таблицу ErrorLog. Вопрос залу: а если упала сама база — куда запишется лог? (Никуда: запись в ErrorLog тоже упадёт, фильтр только напишет в консоль.)',
    ],
  },
  {
    id: 'req-overview',
    section: 'request',
    title: 'Путь запроса целиком',
    steps: 10,
    Component: OverviewSlide,
    notes: [
      'Теперь, когда каждый блок разобран, — весь путь одним проходом. Следите за пакетом: он меняет форму на каждом слое. Можно попросить зал называть работника ресторана на каждом шаге.',
      'Шаги 1–3: guards только проверяют, контроллер только выписывает чек. Логики там нет.',
      'Шаги 4–6: вся работа — в хендлере; Prisma пишет SQL за нас; база возвращает строку как есть (snake_case, Decimal).',
      'Шаги 7–9: presentItem вызывается в конце хендлера; конверт { data, … } добавляет интерцептор — хендлер его не пишет. Вопрос: кто из блоков знает про HTTP? (guards, контроллер, интерцептор).',
    ],
  },
  {
    id: 'kit-quiz',
    section: 'request',
    title: 'Где сломалось на кухне?',
    steps: 5,
    Component: KitchenQuizSlide,
    notes: [
      'Шаг 0: четыре симптома — зал называет работника и место в коде. Тексты ошибок дословные: так их напишут Nest и etalon.',
      'Шаг 1: No handler found — классика после «добавил хендлер, забыл app.module». Сборка проходит, падает только запрос.',
      'Шаг 2: can\'t resolve dependencies — падает уже на старте, и это хорошо: Nest прямо пишет, какого параметра (?) не хватает.',
      'Шаг 3: ловушка — это не баг. 400 с понятным details — нормальная работа повара. Шаг 4: snake_case в ответе — сразу ищем, где забыли presentItem.',
    ],
  },
  {
    id: 'req-layers',
    section: 'request',
    title: 'Кто за что отвечает',
    steps: 3,
    Component: LayersSlide,
    notes: [
      'Итоговая карта обеих лекций: у каждого слоя один вопрос, на который он отвечает. Если код отвечает на чужой вопрос — он лежит не там.',
      'Шаг 0: зал. main.ts — настройка один раз; Guard — кто ты и можно ли; контроллер — тонкий: адрес → команда, DTO — форма входа.',
      'Шаг 1: кухня. Команда — «что хотим», хендлер — «как»: вся логика тут; PrismaService — единственный способ говорить с базой.',
      'Шаг 2: подача. Presenter — форма наружу, интерсептор и фильтр — общий конверт для ответа и ошибки. Спросить: куда положить проверку «цена ≥ 0»? (в хендлер) А «только админ»? (Guard + @Roles)',
    ],
  },
  {
    id: 'kit-recipe',
    section: 'outro',
    title: 'Рецепт: новый эндпоинт',
    steps: 5,
    Component: RecipeSlide,
    notes: [
      'Механизм целиком на маленькой задаче: GET /api/v1/items/count. По одному работнику на клик, файлы — в том порядке, в каком удобно писать.',
      'Шаги 0–1: вопрос без полей и повар, который считает через prisma.item.count(). Это запрос (читает), значит Query и QueryBus.',
      'Шаг 2: строка в QueryHandlers. Забыли — «No handler found for the query», 500.',
      'Шаги 3–4: метод контроллера ставим ВЫШЕ @Get(\':id\'). Иначе Nest сначала сопоставит /items/count с /items/:id, ParseUUIDPipe ответит 400 «Validation failed (uuid is expected)» — проверено на etalon. Домашка: сделать этот эндпоинт и вызвать его из Postman.',
    ],
  },
  {
    id: 'kit-field',
    section: 'outro',
    title: 'Всё вместе: добавить поле',
    steps: 4,
    Component: FieldRecipeSlide,
    notes: [
      'Связываем все три лекции одной задачей: «товару нужна категория». База → Prisma → путь запроса.',
      'Порядок не случаен: без колонки в базе Prisma её не увидит, без типов код не соберётся.',
      'Спросить аудиторию: что будет, если забыть prisma:pull? (TS не знает поле category — ошибка сборки.)',
      'Код идёт по ресторану: чек (item.commands.ts) → форма официанта (DTO, implements — компилятор сам напомнит) → повар (handler) → тарелка (presenter). Домашка: добавить поле в свой проект.',
    ],
  },
];

export const backendKitchenDeck: DeckDef = {
  id: 'backend-kitchen',
  folder: 'backend',
  title: 'С нуля, ч. 2 — Кухня: шина, хендлеры, сервисы',
  description:
    'Дополнение к «Бэкенд изнутри»: путь запроса с нуля на метафоре ресторана, часть 2 из 2. Чек (команда), раздача (CommandBus), повар (хендлер), техника кухни (сервисы и DI), тарелка и поднос (presenter, interceptor), менеджер (ошибки).',
  topics: [
    'Команда — чек; зачем шина, а не прямой вызов',
    'CommandBus и регистрация хендлеров',
    'Сервисы и DI: кто ставит технику на кухню',
    'Хендлер, presenter, конверт ответа и ошибки',
    'Игра «Где сломалось?» и рецепт нового эндпоинта',
  ],
  duration: '50–60 мин',
  level: 'дополнение, после части 1 «Зал»',
  tone: 'logic',
  icon: ChefHat,
  slides,
};
