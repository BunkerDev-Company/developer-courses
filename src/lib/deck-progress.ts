/**
 * Где остановились в презентации — чтобы на главной предложить «Продолжить».
 * Хранится только в этом браузере; нет доступа к localStorage — просто не предлагаем.
 */
export interface SavedPos {
  slide: number;
  step: number;
  at: number;
}

const key = (deckId: string) => `deck-pos:${deckId}`;

export function savePos(deckId: string, slide: number, step: number) {
  try {
    localStorage.setItem(key(deckId), JSON.stringify({ slide, step, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadPos(deckId: string): SavedPos | null {
  try {
    const raw = localStorage.getItem(key(deckId));
    if (!raw) return null;
    const v = JSON.parse(raw) as SavedPos;
    return typeof v.slide === 'number' && typeof v.step === 'number' ? v : null;
  } catch {
    return null;
  }
}
