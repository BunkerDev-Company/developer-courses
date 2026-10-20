'use client';

import { ShieldCheck, X } from 'lucide-react';
import { Code } from '@/components/ui/code';
import { Swap } from '@/components/ui/reveal';
import { M, SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import type { SlideProps } from '@/types';
import { EX } from '../data';
import { Card, Console } from '../parts';

/**
 * Шаги:
 * 0 — @UseGuards(JwtAuthGuard) на классе: все методы лавки — только с токеном
 * 1 — маршрут: @Controller() без префикса + @Post('shop/:code/buy') — так в логе старта
 * 2 — тела нет: цену называет сервер, а не клиент
 * 3 — начисление золота — только admin: RolesGuard + @Roles
 */

// controllers/shop.controller.ts — выдержка.
const CODE = `@UseGuards(JwtAuthGuard)
@Controller()
export class ShopController {
  …
  /** Тела нет: цену называет сервер, а не клиент. */
  @Post('shop/:code/buy')
  buy(@CurrentUserId() userId: string, @Param('code') code: string) {
    return this.commandBus.execute(new BuyUpgradeCommand(userId, code));
  }
  /** Только admin. Начисление идёт через тот же журнал … */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('wallet/grant')
  grant(@Body() dto: GrantGoldDto) { … }
}`;

const HL = [[1], [2, 6], [5, 7, 8], [11, 12, 13, 14]];
const CODE_W = 900;

export function ShopControllerSlide({ step }: SlideProps) {
  return (
    <SlideLayout section="request" title="Контроллер лавки: тела нет">
      <Code
        code={CODE}
        lang="ts"
        size="sm"
        title="controllers/shop.controller.ts"
        hl={HL[step]}
        tone={step === 0 || step === 3 ? 'guard' : 'ctrl'}
        className="absolute"
        style={{ left: 0, top: 0, width: CODE_W }}
      />

      <div className="absolute" style={{ left: CODE_W + 36, top: 0, width: 1440 - CODE_W - 36 }}>
        <Swap k={step}>
          {step === 0 && (
            <Card tone="guard" icon={ShieldCheck} title="Guard на весь класс">
              <div className="flex flex-col gap-2 text-[23px] leading-snug">
                <span>Кошелёк и лавка — только с токеном.</span>
                <span className="text-text-2">Один декоратор над классом — не забудешь его на новом методе.</span>
              </div>
            </Card>
          )}
          {step === 1 && (
            <Console
              title="лог старта игры (начало строк обрезано)"
              lines={[
                { text: 'ShopController {/api/v1}:', kind: 'dim' },
                { text: 'Mapped {/api/v1/wallet, GET} route', kind: 'out' },
                { text: 'Mapped {/api/v1/shop, GET} route', kind: 'out' },
                { text: 'Mapped {/api/v1/shop/:code/buy, POST} route', kind: 'ok' },
                { text: 'Mapped {/api/v1/wallet/grant, POST} route', kind: 'out' },
              ]}
            />
          )}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <Console
                title="что шлёт игра"
                lines={[
                  { text: `POST /api/v1/shop/${EX.upgrade}/buy`, kind: 'out' },
                  { text: 'Authorization: Bearer eyJhbGci…', kind: 'dim' },
                ]}
              />
              <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-danger/40 bg-danger/5 px-5 py-3">
                <X size={26} strokeWidth={3} className="shrink-0 text-danger" />
                <span className="font-mono text-[21px] text-danger line-through decoration-2">{'{ "price": 1 }'}</span>
                <span className="text-[21px] text-text-2">— негде</span>
              </div>
              <div className="text-[23px] leading-snug">
                Клиент говорит только <b>что</b> купить. <b>Сколько</b> стоит — считает хендлер.
              </div>
            </div>
          )}
          {step === 3 && (
            <Card tone="guard" icon={ShieldCheck} title="Начислить золото — только admin">
              <div className="flex flex-col gap-2 text-[23px] leading-snug">
                <span>
                  Игрок вызовет — <M>403</M>, code 41
                </span>
                <span className="text-text-2">Начисление — через тот же журнал WalletTransaction, ref admin:&lt;uuid&gt;</span>
              </div>
            </Card>
          )}
        </Swap>
      </div>

      <StepCaption
        step={step}
        tone={step === 0 || step === 3 ? 'guard' : 'ctrl'}
        captions={[
          <>
            <M>@UseGuards(JwtAuthGuard)</M> над классом — всем методам нужен токен
          </>,
          <>
            Префикса у класса нет: адрес целиком в <M>{"@Post('shop/:code/buy')"}</M>
          </>,
          'Тела нет: игрок говорит, что купить, — цену называет сервер',
          <>
            Начислить золото может только admin: <M>RolesGuard</M> + <M>@Roles</M>
          </>,
        ]}
      />
    </SlideLayout>
  );
}
