import * as storage from './storage.js';

const saved = storage.load() || {};

const state = {
  learned: new Set(saved.learned || []),
  level: saved.level || 'A1',
  minutes: saved.minutes || 45,
  theme: saved.theme || null,
};

const key = (level, day) => `${level}-${day}`;

function persist() {
  storage.save({
    learned: [...state.learned],
    level: state.level,
    minutes: state.minutes,
    theme: state.theme,
  });
}

export const get = () => state;

export const isLearned = (level, day) => state.learned.has(key(level, day));

export function toggleLearned(level, day) {
  const k = key(level, day);
  if (state.learned.has(k)) state.learned.delete(k);
  else state.learned.add(k);
  persist();
  return state.learned.has(k);
}

export function countLearned(level) {
  let n = 0;
  for (const k of state.learned) if (k.startsWith(level + '-')) n++;
  return n;
}

export function markLearned(level, days) {
  days.forEach((d) => state.learned.add(key(level, d)));
  persist();
}

export function resetProgress() {
  state.learned.clear();
  persist();
}

export function setLevel(level) {
  state.level = level;
  persist();
}

export function setMinutes(minutes) {
  state.minutes = minutes;
  persist();
}

export function setTheme(theme) {
  state.theme = theme;
  persist();
}
