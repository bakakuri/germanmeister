import * as state from './state.js';

export function currentTheme() {
  const saved = state.get().theme;
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme() {
  const theme = currentTheme();
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#15141e' : '#f5f3fb');
}

export function toggleTheme() {
  const root = document.documentElement;
  root.classList.add('theme-anim');
  state.setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  applyTheme();
  setTimeout(() => root.classList.remove('theme-anim'), 500);
}
