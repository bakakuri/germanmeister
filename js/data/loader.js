import { CONFIG } from '../config.js';

// ყველა მონაცემი იტვირთება მხოლოდ საჭიროების დროს და ერთხელ.
const cache = new Map();

export function loadJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const request = fetch(`data/${path}?v=${CONFIG.DATA_VERSION}`).then((res) => {
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  });
  cache.set(path, request);
  request.catch(() => cache.delete(path));
  return request;
}

export function clearCache() {
  cache.clear();
}

export const pad = (n) => String(n).padStart(3, '0');
const lc = (s) => String(s).toLowerCase();

export const loadIndex = () => loadJSON('index.json');
export const loadPlan = () => loadJSON('plan.json');
export const loadPhonetics = () => loadJSON('phonetics.json');

export const loadDay = (level, day) => loadJSON(`days/${lc(level)}/day-${pad(day)}.json`);
export const loadWords = (level, day) => loadJSON(`words/${lc(level)}/day-${pad(day)}.json`);
export const loadExercises = (level, day) => loadJSON(`exercises/${lc(level)}/day-${pad(day)}.json`);

export const loadDictManifest = () => loadJSON('dict/manifest.json');
export const loadDictLetter = (letter) => loadJSON(`dict/${letter}.json`);

export const loadGrammarIndex = () => loadJSON('grammar/index.json');
export const loadGrammar = (level, id) => loadJSON(`grammar/${lc(level)}/${id}.json`);

export const loadPracticeManifest = () => loadJSON('practice/manifest.json');
export const loadPracticeNouns = (level) => loadJSON(`practice/nouns-${lc(level)}.json`);
export const loadPracticeSentences = (level) => loadJSON(`practice/sentences-${lc(level)}.json`);

// შემდეგი დღის წინასწარი ჩატვირთვა, როცა ბრაუზერი თავისუფალია.
export function prefetch(...tasks) {
  if (!CONFIG.PREFETCH_NEXT_DAY) return;
  const run = () => tasks.forEach((t) => t().catch(() => {}));
  if ('requestIdleCallback' in window) requestIdleCallback(run);
  else setTimeout(run, 400);
}
