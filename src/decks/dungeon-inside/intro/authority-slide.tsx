'use client';

import { motion } from 'framer-motion';
import { Cpu, Gamepad2, Server, X } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';
import { Chip } from '@/components/ui/chip';
import { Code } from '@/components/ui/code';
import { NodeBox } from '@/components/ui/node-box';
import { Reveal } from '@/components/ui/reveal';
import { SlideLayout } from '@/components/ui/slide-layout';
import { StepCaption } from '@/components/ui/step-caption';
import { EASE } from '@/lib/motion';
import type { Tone } from '@/lib/tones';
import type { SlideProps } from '@/types';

/**
 * Шаги:
 * 0 — этап 1: бой считает клиент, сервер проверяет его заявления
 * 1 — этап 2: клиент шлёт только ввод, сервер сам считает бой и рассылает снимки
 * 2 — читы этапа 1 невозможны в принципе: заявлять серверу нечего
 */

// Комментарии из миграций — дословно, перенесены по ширине панели.
const STAGE1 = `-- Сервер не симулирует бой — это делает клиент.
-- Но всё, что влияет на прогресс, сервер ведёт сам:
-- номер волны, время её начала, …`;

const STAGE2 = `-- теперь сервер САМ считает бой и видит
-- каждое убийство, поэтому монеты с мобов
-- можно начислять честно. На этапе 1 так было
-- нельзя — клиент мог «убить» кого угодно.`;

const COL_W = 690;
const RIGHT_X = 1440 - COL_W;
const BOX_W = 200;
const LANE_X = BOX_W + 14;
const LANE_W = COL_W - 2 * BOX_W - 28;

interface Msg {
  text: string;
  tone: Tone;
  back?: boolean;
}

const CLAIMS: Msg[] = [
  { text: 'я в (12.4, 7.1)', tone: 'client' },
  { text: 'волна пройдена', tone: 'client' },
  { text: 'открываю сундук', tone: 'client' },
];

const NETCODE: Msg[] = [
  { text: 'input: dx, dy, кнопки', tone: 'client' },
  { text: 'snap — снимок мира', tone: 'logic', back: true },
];

const CHEATS = ['спидхак', 'телепорт', '«убил всех»', '«волна за 0.1 с»'];

function Column({ left, stage, title, active, msgs, server, code, codeTitle }: {
  left: number;
  stage: string;
  title: string;
  active: boolean;
  msgs: Msg[];
  server: { title: string; sub: string };
  code: string;
  codeTitle: string;
}) {
  const laneTop = 70;
  const rowH = 52;
  return (
    <motion.div
      className="absolute"
      style={{ left, top: 0, width: COL_W }}
      initial={false}
      animate={{ opacity: active ? 1 : 0.4 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="flex items-center gap-3">
        <Chip tone={active ? 'accent' : 'muted'} solid={active}>
          {stage}
        </Chip>
        <span className="text-[26px] font-bold">{title}</span>
      </div>
      <div className="relative" style={{ height: 180 }}>
        <NodeBox tone="client" icon={Gamepad2} title="Клиент" sub="canvas" size="sm" className="absolute" style={{ left: 0, top: laneTop, width: BOX_W }} />
        <NodeBox tone="logic" icon={server.title === 'Сервер' ? Server : Cpu} title={server.title} sub={server.sub} size="sm" className="absolute" style={{ left: COL_W - BOX_W, top: laneTop, width: BOX_W }} />
        {msgs.map((m, i) => {
          const y = laneTop - 46 + i * rowH + (msgs.length === 2 ? 26 : 0);
          return (
            <div key={m.text}>
              <Arrow
                from={m.back ? [LANE_X + LANE_W, y + 40] : [LANE_X, y + 40]}
                to={m.back ? [LANE_X, y + 40] : [LANE_X + LANE_W, y + 40]}
                tone={active ? m.tone : 'muted'}
                width={2.5}
              />
              <div className="absolute flex justify-center" style={{ left: LANE_X, top: y, width: LANE_W }}>
                <span className="rounded-lg bg-surface px-2 font-mono text-[18px] font-semibold text-text-2">{m.text}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Code code={code} lang="sql" size="sm" title={codeTitle} />
    </motion.div>
  );
}

export function AuthoritySlide({ step }: SlideProps) {
  return (
    <SlideLayout section="game" title="Главная идея: бой считает сервер">
      <Column
        left={0}
        stage="этап 1"
        title="клиент считает бой"
        active={step === 0}
        msgs={CLAIMS}
        server={{ title: 'Сервер', sub: 'проверяет заявления' }}
        code={STAGE1}
        codeTitle="…_runs-up.sql"
      />
      <Reveal show={step >= 1} from="left" className="absolute" style={{ left: RIGHT_X, top: 0, width: COL_W }}>
        <div className="relative" style={{ width: COL_W }}>
          <Column
            left={0}
            stage="этап 2"
            title="клиент шлёт только ввод"
            active={step >= 1}
            msgs={NETCODE}
            server={{ title: 'Симуляция', sub: '20 тиков/с' }}
            code={STAGE2}
            codeTitle="…_settings-and-admin-log-up.sql"
          />
        </div>
      </Reveal>

      {/* Шаг 2: читы этапа 1 — заявлять нечего */}
      <Reveal show={step === 2} from="up" className="absolute" style={{ left: 0, top: 452, width: 1440 }}>
        <div className="flex items-center justify-center gap-4">
          {CHEATS.map((c) => (
            <span key={c} className="flex items-center gap-2 rounded-xl border-2 border-danger/40 bg-danger/5 px-4 py-2 text-[24px] font-semibold text-danger">
              <X size={24} strokeWidth={3} />
              <span className="line-through decoration-2">{c}</span>
            </span>
          ))}
        </div>
      </Reveal>

      <StepCaption
        step={step}
        tone={step === 0 ? 'client' : 'logic'}
        captions={[
          'Этап 1: бой считает клиент — серверу остаётся проверять его заявления',
          'Этап 2: клиент шлёт только нажатия, а мир считает сервер',
          'Позиции и убийств «из запроса» больше нет — заявлять серверу нечего',
        ]}
      />
    </SlideLayout>
  );
}
