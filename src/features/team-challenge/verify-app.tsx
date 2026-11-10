'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, SearchCheck, XCircle } from 'lucide-react';
import { createProof, isProofCode, isStudentCode } from './proof';
import styles from './team-challenge.module.css';

export function VerifyApp() {
  const [studentCode, setStudentCode] = useState('');
  const [submittedProof, setSubmittedProof] = useState('');
  const [expectedProof, setExpectedProof] = useState('');
  const [error, setError] = useState('');

  const inspect = async () => {
    if (!isStudentCode(studentCode)) {
      setError('Код студента — ровно 4 цифры');
      setExpectedProof('');
      return;
    }
    setError('');
    setExpectedProof(await createProof(studentCode));
  };

  const compared = Boolean(expectedProof && submittedProof);
  const matches = compared && isProofCode(submittedProof) && submittedProof === expectedProof;

  return (
    <main className={`${styles.shell} ${styles.verifyShell}`}>
      <div className={styles.noise} />
      <header className={styles.header}>
        <Link href="/" className={styles.brand}><ArrowLeft size={18} /><span>К презентациям</span></Link>
        <div className={styles.headerProgress}><small>Панель преподавателя</small></div>
        <div className={styles.studentBadge}><SearchCheck size={18} /> Проверка</div>
      </header>

      <section className={styles.verifyLayout}>
        <div className={styles.verifyCopy}>
          <span className={styles.superLabel}>Контроль результата</span>
          <h1>Сверка кода<br />прохождения</h1>
          <p>Введите четырёхзначный код студента — страница покажет, какой код подтверждения он должен был получить. Добавьте шестизначный код, который прислал студент, и сверка пройдёт автоматически.</p>
          <Link href="/interactive" className={styles.backLink}><ArrowLeft size={18} /> Студенческий маршрут</Link>
        </div>

        <div className={styles.verifyPanel}>
          <div className={styles.verifyTitle}><KeyRound size={24} /><span>Сверка одного студента</span></div>
          <label htmlFor="verify-student">Код студента · 4 цифры</label>
          <input
            id="verify-student"
            className={styles.verifyInput}
            inputMode="numeric"
            maxLength={4}
            value={studentCode}
            placeholder="0000"
            onChange={(event) => {
              setStudentCode(event.target.value.replace(/\D/g, '').slice(0, 4));
              setExpectedProof('');
              setError('');
            }}
          />
          <label htmlFor="verify-proof">Код подтверждения от студента · 6 цифр <span>необязательно</span></label>
          <input
            id="verify-proof"
            className={styles.verifyInput}
            inputMode="numeric"
            maxLength={6}
            value={submittedProof}
            placeholder="000000"
            onChange={(event) => setSubmittedProof(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          {error && <div className={styles.inputError}>{error}</div>}
          <button className={styles.primaryButton} onClick={inspect}><SearchCheck size={19} /> Проверить</button>

          {expectedProof && (
            <div className={styles.verifyResult}>
              <span>Правильный код подтверждения</span>
              <strong>{expectedProof}</strong>
              {submittedProof && (
                <div className={matches ? styles.matchYes : styles.matchNo}>
                  {matches ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  {matches ? 'Коды совпадают' : 'Коды не совпадают'}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

