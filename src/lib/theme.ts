const THEME_KEY = 'slides-theme';

/** Тема при загрузке: `?theme=dark` в адресе (для скриншотов) или то, что выбрали раньше. */
export function initTheme() {
  const forced = new URLSearchParams(window.location.search).get('theme');
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch {
    /* приватный режим — просто светлая */
  }
  document.documentElement.classList.toggle('dark', (forced ?? saved) === 'dark');
}

/** Переключить тему и запомнить. Возвращает true, если теперь тёмная. */
export function toggleTheme(): boolean {
  const dark = document.documentElement.classList.toggle('dark');
  try {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  } catch {
    /* не запомнится — не страшно */
  }
  return dark;
}
