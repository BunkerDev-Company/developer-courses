const scope = 'tc-3:1021122112211:2026';

export function isStudentCode(value: string) {
  return /^\d{4}$/.test(value);
}

export function isProofCode(value: string) {
  return /^\d{6}$/.test(value);
}

export async function createProof(studentCode: string): Promise<string> {
  if (!isStudentCode(studentCode)) throw new Error('Invalid student code');

  const bytes = new TextEncoder().encode(`${scope}:${studentCode}`);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  let value = 0;
  for (let index = 0; index < 6; index += 1) value = value * 256 + hash[index];
  return (value % 1_000_000).toString().padStart(6, '0');
}

