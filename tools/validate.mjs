// ამოწმებს მონაცემების სისწორეს:  npm run validate
// ცდომილებებზე (✗) გამოდის კოდით 1, გაფრთხილებები (!) არ ჩერდება.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, LEVELS, readJSON, listFiles, loadAllWords, orderKey } from './lib.mjs';

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const GEORGIAN = /^[ა-ჿ\s,.!?;:'’\-–—()„“"/]+$/;
const KNOWN_POS = ['noun', 'verb', 'adj', 'adv', 'pron', 'prep', 'conj', 'num', 'interj', 'det', 'phrase'];

const meta = readJSON(join(DATA, 'meta', 'function-words.json'));
const FUNCTION_WORDS = new Set(meta.functionWords.map((s) => s.toLowerCase()));
const NAMES = new Set(meta.names.map((s) => s.toLowerCase()));

const words = loadAllWords();
const byId = new Map();
// ფორმა → ყველაზე ადრეული დღე, როცა ის ისწავლება
const firstSeen = new Map();

for (const w of words) {
  const key = orderKey(w.level, w.day);
  const forms = [w.de, ...(w.forms || []), w.plural].filter(Boolean).map((s) => s.toLowerCase());
  for (const f of forms) if (!firstSeen.has(f) || firstSeen.get(f) > key) firstSeen.set(f, key);
}

const tokensOf = (s) => String(s).split(/[^A-Za-zÄÖÜäöüß]+/).filter(Boolean);

function checkTokens(label, text, level, day) {
  const key = orderKey(level, day);
  for (const token of tokensOf(text)) {
    const t = token.toLowerCase();
    if (FUNCTION_WORDS.has(t) || NAMES.has(t)) continue;
    const seen = firstSeen.get(t);
    if (seen === undefined) warn(`${label}: „${token}“ არ არის ბაზაში (დაამატე სიტყვა ან forms, ან function-words.json)`);
    else if (seen > key) warn(`${label}: „${token}“ ჯერ არ არის ნასწავლი ამ დღემდე`);
  }
}

function checkSentence(label, ex, level, day, reference = false) {
  for (const k of ['de', 'ph', 'ka']) if (!ex?.[k]) err(`${label}: მაგალითს აკლია „${k}“`);
  if (!ex?.de || !ex?.ph) return;
  if (!GEORGIAN.test(ex.ph)) err(`${label}: ფონეტიკა უნდა იყოს მხოლოდ ქართულით: „${ex.ph}“`);
  if (tokensOf(ex.de).length !== ex.ph.split(/\s+/).filter(Boolean).length) {
    warn(`${label}: სიტყვების რაოდენობა გერმანულსა და ფონეტიკაში განსხვავდება`);
  }
  if (!reference) checkTokens(label, ex.de, level, day);
}

/* ---------- სიტყვები ---------- */
for (const w of words) {
  const where = `${w._file} · ${w.id || '?'}`;
  for (const k of ['id', 'level', 'day', 'de', 'pos', 'ph', 'ka', 'example']) {
    if (w[k] == null || w[k] === '') err(`${where}: აკლია ველი „${k}“`);
  }
  if (w.id) {
    if (byId.has(w.id)) err(`${where}: დუბლირებული id`);
    byId.set(w.id, w);
    if (!/^[a-c][12]-\d{5}$/.test(w.id)) err(`${where}: id-ის ფორმატი უნდა იყოს a1-00001`);
    if (w.id.slice(0, 2) !== String(w.level).toLowerCase()) err(`${where}: id-ის დონე არ ემთხვევა level-ს`);
  }
  if (w.level !== w._fileLevel || w.day !== w._fileDay) err(`${where}: level/day არ ემთხვევა ფაილის გზას`);
  if (!Array.isArray(w.ka) || !w.ka.length) err(`${where}: „ka“ უნდა იყოს არაცარიელი მასივი`);
  if (w.pos && !KNOWN_POS.includes(w.pos)) warn(`${where}: უცნობი pos „${w.pos}“`);
  if (w.pos === 'noun' && !w.article) err(`${where}: არსებითს სჭირდება article`);
  if (w.ph && !GEORGIAN.test(w.ph)) err(`${where}: ფონეტიკა უნდა იყოს მხოლოდ ქართულით: „${w.ph}“`);
}

for (const w of words) {
  const where = `${w._file} · ${w.id}`;
  if (!w.example) continue;
  checkSentence(where, w.example, w.level, w.day);
  const key = orderKey(w.level, w.day);
  for (const uid of w.example.uses || []) {
    const u = byId.get(uid);
    if (!u) err(`${where}: uses — id „${uid}“ ბაზაში არ არის`);
    else if (orderKey(u.level, u.day) > key) err(`${where}: uses — „${u.de}“ ამ დღემდე ჯერ არ ისწავლება`);
  }
}

/* ---------- დღეები ---------- */
for (const level of LEVELS) {
  const dir = join(DATA, 'days', level.toLowerCase());
  for (const file of listFiles(dir, /^day-\d+\.json$/)) {
    const day = Number(file.match(/\d+/)[0]);
    const where = `days/${level.toLowerCase()}/${file}`;
    const d = readJSON(join(dir, file));
    if (d.level !== level || d.day !== day) err(`${where}: level/day არ ემთხვევა ფაილის გზას`);
    if (!d.title) err(`${where}: აკლია title`);
    for (const id of d.words || []) {
      const w = byId.get(id);
      if (!w) err(`${where}: სიტყვა „${id}“ ვერ მოიძებნა`);
      else if (w.level !== level || w.day !== day) err(`${where}: სიტყვა „${id}“ სხვა დღეს ეკუთვნის`);
    }
    for (const gid of d.grammar || []) {
      if (!existsSync(join(DATA, 'grammar', level.toLowerCase(), `${gid}.json`))) err(`${where}: გრამატიკის თემა „${gid}“ ვერ მოიძებნა`);
    }
    if (d.exercises && !existsSync(join(DATA, 'exercises', level.toLowerCase(), file))) {
      err(`${where}: exercises=true, მაგრამ ფაილი exercises/${level.toLowerCase()}/${file} არ არის`);
    }
    for (const [i, line] of (d.reading?.lines || []).entries()) checkSentence(`${where} · reading[${i}]`, line, level, day);
  }
}

/* ---------- სავარჯიშოები ---------- */
const NEEDS = {
  choice: ['q', 'options', 'answer'],
  fill: ['q', 'answer'],
  order: ['words', 'answer'],
  article: ['word', 'answer'],
  dictation: ['de'],
};
for (const level of LEVELS) {
  const dir = join(DATA, 'exercises', level.toLowerCase());
  for (const file of listFiles(dir, /^day-\d+\.json$/)) {
    const day = Number(file.match(/\d+/)[0]);
    const where = `exercises/${level.toLowerCase()}/${file}`;
    readJSON(join(dir, file)).forEach((ex, i) => {
      const label = `${where}[${i}]`;
      if (!NEEDS[ex.type]) return err(`${label}: უცნობი type „${ex.type}“`);
      for (const k of NEEDS[ex.type]) if (ex[k] == null) err(`${label}: ${ex.type}-ს აკლია „${k}“`);
      if (ex.type === 'dictation') checkTokens(label, ex.de, level, day);
      if (ex.type === 'order') checkTokens(label, ex.answer, level, day);
    });
  }
}

/* ---------- გრამატიკა ---------- */
const topicIds = new Set();
const topics = [];
for (const level of LEVELS) {
  const dir = join(DATA, 'grammar', level.toLowerCase());
  for (const file of listFiles(dir, /\.json$/)) {
    const t = readJSON(join(dir, file));
    topics.push({ t, level, file });
    topicIds.add(t.id);
  }
}
for (const { t, level, file } of topics) {
  const where = `grammar/${level.toLowerCase()}/${file}`;
  if (`${t.id}.json` !== file) err(`${where}: ფაილის სახელი უნდა იყოს ${t.id}.json`);
  for (const k of ['id', 'level', 'title']) if (!t[k]) err(`${where}: აკლია „${k}“`);
  // თემა, რომელსაც day არ აქვს, საცნობარო გრამატიკაა და ლექსიკის თანმიმდევრობას არ ამოწმებს
  for (const [i, ex] of (t.examples || []).entries()) checkSentence(`${where} · examples[${i}]`, ex, level, t.day || 1, !t.day);
  for (const id of [...(t.requires || []), ...(t.next || [])]) if (!topicIds.has(id)) err(`${where}: ბმული „${id}“ ვერ მოიძებნა`);
}

/* ---------- შედეგი ---------- */
warnings.forEach((m) => console.log(`! ${m}`));
errors.forEach((m) => console.log(`✗ ${m}`));
console.log(`\nსიტყვები: ${words.length} · გრამატიკა: ${topics.length} · შეცდომა: ${errors.length} · გაფრთხილება: ${warnings.length}`);
if (errors.length) process.exit(1);
console.log('✓ მონაცემები სწორია');
