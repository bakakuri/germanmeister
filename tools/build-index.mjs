// აგენერირებს მსუბუქ ინდექსებს data/ ფაილებიდან.
// გაუშვი ყოველ ჯერზე, როცა სიტყვას, დღეს ან გრამატიკის თემას დაამატებ:  npm run build:data
import { rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, LEVELS, readJSON, writeJSON, listFiles, baseLetter, loadAllWords } from './lib.mjs';

const words = loadAllWords();

/* ---------- ლექსიკონი: ფაილი ყოველ ასოზე + manifest ---------- */
const dictDir = join(DATA, 'dict');
rmSync(dictDir, { recursive: true, force: true });
mkdirSync(dictDir, { recursive: true });

const byLetter = new Map();
for (const w of words) {
  const k = baseLetter(w.de[0]);
  if (!byLetter.has(k)) byLetter.set(k, []);
  byLetter.get(k).push({
    id: w.id,
    de: w.de,
    article: w.article || null,
    pos: w.pos,
    ka: w.ka,
    ph: w.ph,
    level: w.level,
    day: w.day,
  });
}
for (const [k, list] of byLetter) {
  list.sort((a, b) => a.de.localeCompare(b.de, 'de'));
  writeJSON(join(dictDir, `${k}.json`), list);
}
const letters = [...byLetter].map(([k, list]) => ({ k, n: list.length })).sort((a, b) => a.k.localeCompare(b.k));
writeJSON(join(dictDir, 'manifest.json'), { total: words.length, letters });

/* ---------- პრაქტიკა: არსებითი სახელები და წინადადებები დონეების მიხედვით ---------- */
const practiceDir = join(DATA, 'practice');
rmSync(practiceDir, { recursive: true, force: true });
mkdirSync(practiceDir, { recursive: true });

const practiceLevels = {};
for (const level of LEVELS) {
  const mine = words.filter((w) => w.level === level);
  const nouns = mine
    .filter((w) => w.pos === 'noun' && w.article)
    .map((w) => ({ id: w.id, de: w.de, article: w.article, ka: w.ka, ph: w.ph }));
  const seen = new Set();
  const sentences = [];
  for (const w of mine) {
    const ex = w.example;
    if (!ex || seen.has(ex.de)) continue;
    seen.add(ex.de);
    sentences.push({ id: ex.id, de: ex.de, ph: ex.ph, ka: ex.ka });
  }
  if (!nouns.length && !sentences.length) continue;
  writeJSON(join(practiceDir, `nouns-${level.toLowerCase()}.json`), nouns);
  writeJSON(join(practiceDir, `sentences-${level.toLowerCase()}.json`), sentences);
  practiceLevels[level] = { nouns: nouns.length, sentences: sentences.length };
}
writeJSON(join(practiceDir, 'manifest.json'), { levels: practiceLevels });

/* ---------- გრამატიკის სია ---------- */
const topics = [];
for (const level of LEVELS) {
  const dir = join(DATA, 'grammar', level.toLowerCase());
  for (const file of listFiles(dir, /\.json$/)) {
    const t = readJSON(join(dir, file));
    topics.push({ id: t.id, level: t.level || level, day: t.day || null, title: t.title, category: t.category || '' });
  }
}
topics.sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.id.localeCompare(b.id));
writeJSON(join(DATA, 'grammar', 'index.json'), { topics });

/* ---------- index.json: რომელი დღეებია მზად ---------- */
const indexPath = join(DATA, 'index.json');
const index = readJSON(indexPath);
for (const lv of index.levels) {
  const dir = join(DATA, 'days', lv.id.toLowerCase());
  lv.ready = listFiles(dir, /^day-\d+\.json$/)
    .map((f) => Number(f.match(/\d+/)[0]))
    .sort((a, b) => a - b);
}
writeJSON(indexPath, index, true);

console.log(`სიტყვები: ${words.length} · ასოები: ${letters.length} · გრამატიკა: ${topics.length}`);
console.log(index.levels.map((l) => `${l.id}: ${l.ready.length}/${l.days} დღე`).join(' · '));
