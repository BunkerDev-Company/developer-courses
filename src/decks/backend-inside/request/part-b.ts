import type { SlideDef } from '@/types';
import { DiSlide } from './di-slide';
import { ErrorsSlide } from './errors-slide';
import { HandlerSlide } from './handler-slide';
import { InterceptorSlide } from './interceptor-slide';
import { LayersSlide } from './layers-slide';
import { PresenterSlide } from './presenter-slide';

/** Вторая половина раздела: от DI и хендлера до ответа и ошибок. */
export const requestSlidesB: SlideDef[] = [
  {
    id: 'req-di',
    section: 'request',
    title: 'DI: откуда у хендлера prisma',
    steps: 4,
    Component: DiSlide,
    notes: [
      'Шаг 0: в хендлере нет ни одного new. Он только перечисляет в конструкторе, что ему нужно, — типами. Спросить: «а кто тогда создал prisma?»',
      'Шаги 1–2: при старте Nest смотрит на типы параметров, находит готовые объекты в контейнере (их список — providers в app.module.ts) и сам вызывает new CreateItemHandler(prisma, errors, notifications).',
      'Шаг 3: PrismaService создан один раз — у всего приложения один пул подключений к базе. Если бы каждый хендлер делал new PrismaClient(), подключений было бы десятки.',
      'Там же: в тесте вместо настоящего PrismaService подсовывают фейк ({ provide, useValue }) — код хендлера не меняется. Забыли добавить класс в providers → Nest при старте скажет «can\'t resolve dependencies».',
    ],
  },
  {
    id: 'req-handler',
    section: 'request',
    title: 'Handler: вся логика здесь',
    steps: 5,
    Component: HandlerSlide,
    notes: [
      'Шаг 0: шина вызвала execute(command). Первым делом — проверка входа. Пустой title → errors.throw, и дальше хендлер не идёт (что будет с ошибкой — через пару слайдов).',
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
    Component: PresenterSlide,
    notes: [
      'presentItem — обычная функция: берёт строку из базы и собирает объект для ответа. Никакой магии, поле за полем.',
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
    Component: InterceptorSlide,
    notes: [
      'Шаг 0: хендлер возвращает только товар. Про responseTime, версию и прочее он ничего не знает — и не должен.',
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
    Component: ErrorsSlide,
    notes: [
      'Шаги 0–1: хендлер не возвращает ошибку, а бросает исключение: errors.throw(\'VALIDATION\', \'Название обязательно\'). С этого места код дальше не идёт — Prisma, presenter, ResponseInterceptor пропущены.',
      'Шаг 2: исключение ловит GlobalExceptionFilter и отвечает своим конвертом: code и message — из каталога app-errors.ts (VALIDATION = 5, 400), details — наш текст для человека. Фронт ветвится по code, а не по тексту.',
      'Шаг 3: axios-интерсептор подменяет message на details, apiError(e) отдаёт его в toast.error — пользователь видит «Название обязательно» без единого if в компоненте.',
      'Шаг 4: непредвиденное (здесь — забыли migrate:up, Prisma не нашла колонку) → 500, code 99, details: null, наружу подробностей не даём, а сама ошибка со стеком пишется в таблицу ErrorLog. Вопрос залу: а если упала сама база — куда запишется лог? (Никуда: запись в ErrorLog тоже упадёт, фильтр только напишет в консоль.)',
    ],
  },
  {
    id: 'req-layers',
    section: 'request',
    title: 'Кто за что отвечает',
    steps: 3,
    Component: LayersSlide,
    notes: [
      'Итоговая карта раздела: у каждого слоя один вопрос, на который он отвечает. Если код отвечает на чужой вопрос — он лежит не там.',
      'Шаг 0: main.ts — настройка один раз; Guard — кто ты и можно ли; контроллер — тонкий: адрес → команда, DTO — форма входа.',
      'Шаг 1: команда — «что хотим», хендлер — «как»: вся логика тут; PrismaService — единственный способ говорить с базой.',
      'Шаг 2: presenter — форма наружу, интерсептор и фильтр — общий конверт для ответа и ошибки. Спросить: куда положить проверку «цена ≥ 0»? (в хендлер) А «только админ»? (Guard + @Roles)',
    ],
  },
];
