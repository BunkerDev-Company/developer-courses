// Коды студентов для интерактива (/interactive).
//
//   npm run codes -- _notes/students/ai-group.txt
//
// Вход — текстовый файл, по студенту на строку: «ФИО» или «1234  ФИО» (код уже выдан).
// Студентам без кода скрипт выдаёт случайный четырёхзначный и дописывает его в тот же файл,
// поэтому повторный запуск (например, после добавления студента) старые коды не меняет.
// Рядом пишет <имя>.md — таблицу для преподавателя: ФИО, код студента и шестизначный код,
// который студент получит в конце интерактива.
//
// Код подтверждения считает тот же proof.ts, что и сайт (Node 24 запускает .ts без сборки).
// Списки студентов — персональные данные: держите их в _notes/ (не попадает в git).

import { randomInt } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { createProof } from '../src/features/team-challenge/proof.ts';

const file = process.argv[2];
if (!file) {
  console.error('Укажите файл со списком: npm run codes -- _notes/students/группа.txt');
  process.exit(1);
}

const students = readFileSync(file, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const m = line.match(/^(\d{4})\s+(.+)$/);
    return m ? { code: m[1], name: m[2] } : { code: '', name: line };
  });

const used = new Set(students.map((s) => s.code).filter(Boolean));
if (used.size !== students.filter((s) => s.code).length) {
  console.error('В списке повторяются коды — исправьте вручную.');
  process.exit(1);
}

for (const s of students) {
  if (s.code) continue;
  let code;
  // 1000–9999: без ведущего нуля, чтобы код не путали при вводе.
  do code = String(randomInt(1000, 10000));
  while (used.has(code));
  used.add(code);
  s.code = code;
}

writeFileSync(file, students.map((s) => `${s.code}  ${s.name}`).join('\n') + '\n', 'utf8');

const rows = await Promise.all(students.map(async (s) => ({ ...s, proof: await createProof(s.code) })));
const proofs = new Set(rows.map((r) => r.proof));
if (proofs.size !== rows.length) console.warn('Внимание: у двух студентов совпали коды подтверждения.');

const md = [
  `# Коды интерактива — ${basename(file).replace(/\.[^.]+$/, '')}`,
  '',
  'Код студента выдаём каждому лично. Код подтверждения студент увидит в конце интерактива, если наберёт проходной балл, и пришлёт преподавателю.',
  '',
  '| № | ФИО | Код студента | Код подтверждения |',
  '|---|-----|:------------:|:-----------------:|',
  ...rows.map((r, i) => `| ${i + 1} | ${r.name} | ${r.code} | ${r.proof} |`),
  '',
].join('\n');

const out = file.replace(/\.[^.]+$/, '') + '.md';
writeFileSync(out, md, 'utf8');
console.log(`Готово: ${rows.length} студентов → ${out}`);
