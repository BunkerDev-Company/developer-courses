'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Clipboard, KeyRound, Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react';
import { plural } from '@/components/library/deck-card';
import { MODULES, PASSING_SCORE, TOTAL_QUESTIONS, type ChallengeModule, type Lesson } from './content';
import { createProof, isStudentCode } from './proof';
import styles from './team-challenge.module.css';

type Screen = 'gate' | 'lesson' | 'quiz' | 'checkpoint' | 'result';

export function ChallengeApp() {
  const [studentCode, setStudentCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [screen, setScreen] = useState<Screen>('gate');
  const [moduleIndex, setModuleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [proof, setProof] = useState('');
  const [copied, setCopied] = useState(false);

  const currentModule = MODULES[moduleIndex];
  const currentQuestion = currentModule.questions[questionIndex];
  const answeredCount = Object.keys(answers).length;
  const score = useMemo(
    () => MODULES.reduce((total, module) => total + module.questions.filter((question) => answers[question.id] === question.correct).length, 0),
    [answers],
  );
  const passed = score >= PASSING_SCORE;

  useEffect(() => {
    if (screen !== 'result' || !passed) return;
    let active = true;
    createProof(studentCode).then((value) => active && setProof(value));
    return () => {
      active = false;
    };
  }, [passed, screen, studentCode]);

  const enter = () => {
    if (!isStudentCode(studentCode)) {
      setCodeError('Код — ровно 4 цифры');
      return;
    }
    setCodeError('');
    setScreen('lesson');
  };

  const nextLesson = () => {
    if (lessonIndex < currentModule.lessons.length - 1) {
      setLessonIndex((value) => value + 1);
    } else {
      setQuestionIndex(0);
      setSelected(answers[currentModule.questions[0].id] ?? null);
      setScreen('quiz');
    }
  };

  const previousLesson = () => {
    if (lessonIndex > 0) setLessonIndex((value) => value - 1);
  };

  const commitAnswer = () => {
    if (selected === null) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: selected };
    setAnswers(nextAnswers);

    if (questionIndex < currentModule.questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setSelected(nextAnswers[currentModule.questions[nextIndex].id] ?? null);
    } else {
      setScreen('checkpoint');
    }
  };

  const continueAfterCheckpoint = () => {
    if (moduleIndex < MODULES.length - 1) {
      setModuleIndex((value) => value + 1);
      setLessonIndex(0);
      setQuestionIndex(0);
      setSelected(null);
      setScreen('lesson');
    } else {
      setScreen('result');
    }
  };

  const retry = () => {
    setAnswers({});
    setModuleIndex(0);
    setLessonIndex(0);
    setQuestionIndex(0);
    setSelected(null);
    setProof('');
    setScreen('lesson');
  };

  const copyProof = async () => {
    if (!proof) return;
    await navigator.clipboard.writeText(proof);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className={styles.shell}>
      <div className={styles.noise} />
      <Header studentCode={studentCode} screen={screen} moduleIndex={moduleIndex} answered={answeredCount} />

      {screen === 'gate' && (
        <section className={styles.gate}>
          <div className={styles.gateCopy}>
            <span className={styles.superLabel}>Самостоятельная работа</span>
            <h1>Проведи задачу<br /><em>через команду</em></h1>
            <p>
              Три коротких блока: бэкенд, корпоративная культура и командная разработка.
              Прочитайте материал, ответьте на вопросы — и получите код, который нужно отправить преподавателю.
            </p>
            <div className={styles.metrics} aria-label="Параметры интерактива">
              <div><strong>{MODULES.length}</strong><span>{plural(MODULES.length, 'блок', 'блока', 'блоков')}</span></div>
              <div><strong>{TOTAL_QUESTIONS}</strong><span>{plural(TOTAL_QUESTIONS, 'вопрос', 'вопроса', 'вопросов')}</span></div>
              <div><strong>≈25</strong><span>минут</span></div>
            </div>
          </div>

          <div className={styles.accessPanel}>
            <div className={styles.accessTop}>
              <span>Вход</span>
              <KeyRound size={24} />
            </div>
            <label htmlFor="student-code">Персональный код</label>
            <input
              id="student-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={studentCode}
              onChange={(event) => {
                setStudentCode(event.target.value.replace(/\D/g, '').slice(0, 4));
                setCodeError('');
              }}
              onKeyDown={(event) => event.key === 'Enter' && enter()}
              placeholder="0000"
              aria-invalid={Boolean(codeError)}
              aria-describedby="code-help"
            />
            <div id="code-help" className={codeError ? styles.inputError : styles.inputHint}>
              {codeError || 'Четыре цифры, которые выдал преподаватель'}
            </div>
            <button className={styles.primaryButton} onClick={enter}>
              Начать маршрут <ArrowRight size={20} />
            </button>
          </div>
        </section>
      )}

      {screen === 'lesson' && (
        <LessonScreen
          module={currentModule}
          moduleIndex={moduleIndex}
          lessonIndex={lessonIndex}
          onNext={nextLesson}
          onPrevious={previousLesson}
        />
      )}

      {screen === 'quiz' && (
        <section className={`${styles.workArea} ${toneClass(currentModule.id)}`}>
          <ModuleRail module={currentModule} moduleIndex={moduleIndex} mode="quiz" />
          <div className={styles.quizPanel}>
            <div className={styles.quizMeta}>
              <span>Проверка понимания</span>
              <span>{String(questionIndex + 1).padStart(2, '0')} / {String(currentModule.questions.length).padStart(2, '0')}</span>
            </div>
            <div className={styles.questionNumber}>Q{String(questionIndex + 1).padStart(2, '0')}</div>
            <h2>{currentQuestion.prompt}</h2>
            {currentQuestion.context && <p>{currentQuestion.context}</p>}
            <div className={styles.options} role="radiogroup" aria-label="Варианты ответа">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected === index}
                  className={selected === index ? styles.optionSelected : styles.option}
                  onClick={() => setSelected(index)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                  <i>{selected === index && <Check size={18} />}</i>
                </button>
              ))}
            </div>
            <div className={styles.quizFooter}>
              <button className={styles.primaryButton} disabled={selected === null} onClick={commitAnswer}>
                {questionIndex === currentModule.questions.length - 1 ? 'Завершить блок' : 'Следующий вопрос'} <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === 'checkpoint' && (
        <Checkpoint module={currentModule} moduleIndex={moduleIndex} onContinue={continueAfterCheckpoint} />
      )}

      {screen === 'result' && (
        <ResultScreen
          studentCode={studentCode}
          answers={answers}
          score={score}
          passed={passed}
          proof={proof}
          copied={copied}
          onCopy={copyProof}
          onRetry={retry}
        />
      )}
    </main>
  );
}

function Header({ studentCode, screen, moduleIndex, answered }: { studentCode: string; screen: Screen; moduleIndex: number; answered: number }) {
  const progress = screen === 'gate' ? 0 : screen === 'result' ? 100 : Math.round((answered / TOTAL_QUESTIONS) * 100);
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><ArrowLeft size={18} /><span>К презентациям</span></Link>
      <div className={styles.headerProgress}>
        <div><span style={{ width: `${progress}%` }} /></div>
        <small>{screen === 'gate' ? 'Введите код' : screen === 'result' ? 'Маршрут завершён' : `Блок ${moduleIndex + 1} из ${MODULES.length}`}</small>
      </div>
      <div className={styles.studentBadge}><span>ID</span>{studentCode || '••••'}</div>
    </header>
  );
}

function ModuleRail({ module, moduleIndex, mode }: { module: ChallengeModule; moduleIndex: number; mode: 'lesson' | 'quiz' }) {
  return (
    <aside className={styles.moduleRail} aria-label={`Блок ${moduleIndex + 1} из ${MODULES.length}`}>
      <div className={styles.moduleIdentity}>
        <span>{module.number}</span>
        <div><small>{mode === 'lesson' ? 'Материал' : 'Вопросы'}</small><h2>{module.title}</h2></div>
      </div>
      <div className={styles.railDots}>
        {MODULES.map((item, index) => <i key={item.id} className={index <= moduleIndex ? styles.dotActive : ''}><span>{item.number}</span></i>)}
      </div>
    </aside>
  );
}

function LessonScreen({ module, moduleIndex, lessonIndex, onNext, onPrevious }: { module: ChallengeModule; moduleIndex: number; lessonIndex: number; onNext: () => void; onPrevious: () => void }) {
  const lesson = module.lessons[lessonIndex];
  return (
    <section className={`${styles.workArea} ${toneClass(module.id)}`}>
      <ModuleRail module={module} moduleIndex={moduleIndex} mode="lesson" />
      <article className={styles.lessonPanel}>
        <div className={styles.lessonCopy}>
          <div className={styles.lessonMeta}><span>{lesson.eyebrow}</span><span>0{lessonIndex + 1} / 0{module.lessons.length}</span></div>
          <h1>{lesson.title}</h1>
          <p>{lesson.text}</p>
          <div className={styles.lessonNote}><Lightbulb size={20} /><span>{lesson.note}</span></div>
          <div className={styles.lessonControls}>
            <button className={styles.iconButton} onClick={onPrevious} disabled={lessonIndex === 0} aria-label="Предыдущий экран"><ChevronLeft size={20} /></button>
            <div className={styles.lessonSteps}>{module.lessons.map((item, index) => <i key={item.title} className={index === lessonIndex ? styles.stepActive : ''} />)}</div>
            <button className={styles.primaryButton} onClick={onNext}>
              {lessonIndex === module.lessons.length - 1 ? 'Перейти к вопросам' : 'Дальше'} <ArrowRight size={19} />
            </button>
          </div>
        </div>
        <LessonVisual lesson={lesson} />
      </article>
    </section>
  );
}

function LessonVisual({ lesson }: { lesson: Lesson }) {
  const { kind, labels } = lesson.visual;
  const style = { '--items': labels.length } as CSSProperties;
  return (
    <div className={`${styles.visual} ${styles[`visual_${kind}`]}`} style={style} aria-label={labels.join(', ')}>
      <div className={styles.visualBody}>
        {labels.map((label, index) => (
          <div className={styles.visualItem} key={label}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <b>{label}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Checkpoint({ module, moduleIndex, onContinue }: { module: ChallengeModule; moduleIndex: number; onContinue: () => void }) {
  const isLast = moduleIndex === MODULES.length - 1;
  return (
    <section className={`${styles.checkpoint} ${toneClass(module.id)}`}>
      <div className={styles.checkStamp}><Check size={34} /></div>
      <span className={styles.superLabel}>Блок {module.number} завершён</span>
      <h1>{module.title}</h1>
      <button className={styles.primaryButton} onClick={onContinue}>
        {isLast ? 'Собрать результат' : 'Открыть следующий блок'} <ArrowRight size={20} />
      </button>
    </section>
  );
}

function ResultScreen({ studentCode, answers, score, passed, proof, copied, onCopy, onRetry }: { studentCode: string; answers: Record<string, number>; score: number; passed: boolean; proof: string; copied: boolean; onCopy: () => void; onRetry: () => void }) {
  const percent = Math.round((score / TOTAL_QUESTIONS) * 100);
  return (
    <section className={passed ? styles.resultPass : styles.resultFail}>
      <div className={styles.resultIntro}>
        <span className={styles.superLabel}>{passed ? 'Маршрут пройден' : 'Маршрут пока не пройден'}</span>
        <h1>{passed ? 'Отличная работа!' : 'Не хватило правильных ответов'}</h1>
        <p>
          {passed
            ? 'Скопируйте шестизначный код и отправьте его преподавателю вместе со своим именем.'
            : `Для зачёта нужно ${PASSING_SCORE} правильных ответов из ${TOTAL_QUESTIONS}. Перечитайте материал и пройдите маршрут ещё раз.`}
        </p>
        <div className={styles.scoreRing} style={{ '--score': `${percent * 3.6}deg` } as CSSProperties}>
          <div><strong>{percent}%</strong><span>{score} / {TOTAL_QUESTIONS}</span></div>
        </div>
      </div>

      <div className={styles.resultCard}>
        {passed ? (
          <>
            <div className={styles.resultCardTop}><ShieldCheck size={25} /><span>Зачёт</span></div>
            <span className={styles.proofLabel}>Код подтверждения</span>
            <button className={styles.proofCode} onClick={onCopy} disabled={!proof} aria-label="Скопировать код подтверждения">
              {proof || '••••••'} <Clipboard size={22} />
            </button>
            <div className={styles.copyState}>{copied ? 'Скопировано' : 'Нажмите на код, чтобы скопировать'}</div>
            <div className={styles.resultFacts}>
              <div><span>Ваш код</span><b>{studentCode}</b></div>
              <div><span>Блоки</span><b>{MODULES.length} / {MODULES.length}</b></div>
              <div><span>Нужно для зачёта</span><b>{PASSING_SCORE}</b></div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.resultCardTop}><RotateCcw size={25} /><span>Можно пересдать</span></div>
            <h2>Попробуйте ещё раз</h2>
            <p>Материал тот же — ответы можно выбрать заново.</p>
            <button className={styles.primaryButton} onClick={onRetry}><RotateCcw size={19} /> Повторить маршрут</button>
          </>
        )}
        <div className={styles.moduleBreakdown}>
          {MODULES.map((module) => {
            const moduleScore = module.questions.filter((question) => answers[question.id] === question.correct).length;
            return <div key={module.id}><span>{module.number}</span><b>{module.title}</b><i>{moduleScore}/{module.questions.length}</i></div>;
          })}
        </div>
      </div>
    </section>
  );
}

function toneClass(tone: ChallengeModule['id']) {
  if (tone === 'backend') return styles.toneBackend;
  if (tone === 'culture') return styles.toneCulture;
  return styles.toneTools;
}

