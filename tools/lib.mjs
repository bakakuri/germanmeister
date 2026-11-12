import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = join(ROOT, 'data');
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const readJSON = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function writeJSON(path, data, pretty = false) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, pretty ? 2 : 0) + '\n');
}

export function listFiles(dir, re) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => re.test(f)).sort() : [];
}

// იგივე წესი, რაც js/utils/text.js-ში: ä→a, ö→o, ü→u, ß→s
const MAP = { ä: 'a', ö: 'o', ü: 'u', ß: 's' };
export const baseLetter = (ch) => {
  const c = String(ch || '').toLowerCase();
  return MAP[c] || c;
};

// ყველა სიტყვა data/words/**/day-XXX.json ფაილებიდან
export function loadAllWords() {
  const all = [];
  for (const level of LEVELS) {
    const dir = join(DATA, 'words', level.toLowerCase());
    for (const file of listFiles(dir, /^day-\d+\.json$/)) {
      const day = Number(file.match(/\d+/)[0]);
      const rel = `words/${level.toLowerCase()}/${file}`;
      const words = readJSON(join(dir, file));
      words.forEach((w) => all.push({ ...w, _file: rel, _fileLevel: level, _fileDay: day }));
    }
  }
  return all;
}

// თანმიმდევრობის გასაღები: A1 დღე 3 < A1 დღე 4 < A2 დღე 1
export const orderKey = (level, day) => LEVELS.indexOf(level) * 1000 + Number(day);
