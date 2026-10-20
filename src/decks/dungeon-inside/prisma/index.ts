import type { SlideDef } from '@/types';
import { PullSlide } from './pull-slide';
import { RaceSlide } from './race-slide';
import { TxSlide } from './tx-slide';
import { TypesSlide } from './types-slide';

export const prismaSlides: SlideDef[] = [
  {
    id: 'dg-prisma-pull',
    section: 'prisma',
    title: 'db pull: таблица → модель',
    steps: 3,
    Component: PullSlide,
    notes: [
      'Шаг 0: направление всегда одно: база → schema.prisma → типы. Схему пишет миграция, Prisma только читает.',
      'Шаг 1: npm run prisma:pull = prisma db pull + prisma generate. INTEGER стал Int, VARCHAR — String с @db.VarChar, UNIQUE — @@unique с именем ограничения из базы.',
      'Шаг 2: CHECK Prisma не переносит. reason в типах — просто string, поэтому в wallet.service.ts есть тип WalletReason «совпадает с CHECK». Заметьте: в типе уже есть loot, а в этой миграции его нет — его добавила миграция settings-and-admin-log через DROP + ADD. Поменяли CHECK — поменяйте и тип.',
    ],
  },
  {
    id: 'dg-prisma-types',
    section: 'prisma',
    title: 'generate: модель → типы',
    steps: 3,
    Component: TypesSlide,
    notes: [
      'Шаг 0: PlayerUpgrade — уровень улучшения из лавки. Ключ составной (user_id, code), отдельного id нет: один уровень на пару «игрок, улучшение».',
      'Шаг 1: из @@id Prisma сгенерировала поле поиска user_id_code. Его и использует хендлер лавки. Опечатка — ошибка компиляции, а не 500 у игрока.',
      'Шаг 2: findUnique возвращает PlayerUpgrade | null. Улучшение ещё не покупали — строки нет, и TypeScript не даст забыть этот случай: current?.level ?? 0.',
    ],
  },
  {
    id: 'dg-prisma-race',
    section: 'prisma',
    title: 'Гонка двух вкладок',
    steps: 4,
    Component: RaceSlide,
    notes: [
      'Шаг 0: комментарий прямо в коде игры. Игрок открыл лавку в двух вкладках и нажал «Купить» в обеих. Обе прочитали 100, обе решили «хватает», обе записали 20 — купил дважды, заплатил один раз.',
      'Шаг 1: в игре проверка и списание — один запрос: updateMany с where balance >= amount и decrement. По сути это UPDATE "Wallet" SET balance = balance - 80 WHERE user_id = … AND balance >= 80.',
      'Шаг 2: Postgres выполняет два UPDATE одной строки по очереди: второй ждёт, пока первый закоммитится, и проверяет WHERE заново — 20 ≥ 80 уже ложь, обновлено 0 строк.',
      'Шаг 3: count === 0 → NOT_ENOUGH_GOLD: код 71, 409, details для тоста. А если код всё-таки ошибётся — останется CHECK (balance >= 0) из миграции.',
    ],
  },
  {
    id: 'dg-prisma-tx',
    section: 'prisma',
    title: '$transaction: всё или ничего',
    steps: 4,
    Component: TxSlide,
    notes: [
      'Шаг 0: открыть сундук — это четыре записи: факт открытия, золото забега, золото игрока в отряде, кошелёк с журналом. WalletService принимает tx и работает только внутри $transaction: деньги двигаются вместе с тем, за что они двигаются, — или не двигаются вовсе.',
      'Шаг 1: вкладка A — всё прошло, COMMIT.',
      'Шаг 2: вкладка B — тот же сундук. UNIQUE (chest_id) в ChestOpening: база не даст открыть дважды, транзакция откатится целиком — начисления тоже не будет. В одном процессе раньше сработает ещё и флаг busy в RoomsService («Сундук уже открывают»), но последнее слово — за базой.',
      'Шаг 3: Prisma превращает 23505 в P2002, isUniqueViolation из prisma-errors.ts его узнаёт → CHEST_ALREADY_OPENED, 409. Остальные ошибки летят дальше и становятся 500 + запись в ErrorLog.',
    ],
  },
];
