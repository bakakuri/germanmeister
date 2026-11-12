import { CONFIG } from '../config.js';
import { h, fill, artTag } from '../utils/dom.js';
import { speakBtn } from '../utils/audio.js';
import { loadDictManifest, loadDictLetter, loadWords } from '../data/loader.js';
import { baseLetter, isLatin } from '../utils/text.js';
import { wordCard } from './wordcard.js';

function matches(entry, q, rawQuery) {
  if (isLatin(q)) return entry.de.toLowerCase().startsWith(q);
  return entry.ph.includes(rawQuery) || (entry.ka || []).some((k) => k.toLowerCase().includes(q));
}

function entryRow(e, i = 0) {
  let loaded = false;
  const inner = h('div', { class: 'dict-detail-in' });
  const detail = h('div', { class: 'dict-detail' }, inner);
  const head = h(
    'div',
    { class: 'dict-head' },
    h(
      'button',
      {
        class: 'dict-main',
        type: 'button',
        'aria-expanded': 'false',
        onclick: async (ev) => {
          const open = !li.classList.contains('open');
          ev.currentTarget.setAttribute('aria-expanded', String(open));
          li.classList.toggle('open', open);
          if (open && !loaded) {
            loaded = true;
            try {
              const words = await loadWords(e.level, e.day);
              const full = words.find((w) => w.id === e.id);
              inner.replaceChildren(full ? wordCard(full) : h('p', { class: 'muted' }, 'დეტალები ვერ მოიძებნა.'));
            } catch {
              loaded = false;
              inner.replaceChildren(h('p', { class: 'muted' }, 'დეტალები ვერ ჩაიტვირთა.'));
            }
          }
        },
      },
      h('span', { class: 'dict-de' }, artTag(e.article), h('b', null, e.de)),
      h('span', { class: 'dict-ka' }, (e.ka || []).join(', ')),
      h('span', { class: 'dict-lvl' }, `${e.level} · დღე ${e.day}`)
    ),
    speakBtn(e.article ? `${e.article} ${e.de}` : e.de)
  );
  const li = h('li', { class: 'dict-item', style: `--i:${i}` }, head, detail);
  return li;
}

export async function dictPage() {
  const manifest = await loadDictManifest();
  const page = h('section', { class: 'page dict-page', dataset: { title: 'ლექსიკონი' } });

  let letter = manifest.letters[0]?.k || null;
  let entries = [];
  let shown = CONFIG.PAGE_SIZE;
  let ticket = 0;

  const input = h('input', {
    class: 'inp search',
    type: 'search',
    placeholder: 'მოძებნე გერმანულად ან ქართულად',
    'aria-label': 'ლექსიკონში ძებნა',
  });
  const letters = h('div', { class: 'letters', role: 'group', 'aria-label': 'ასოები' });
  const status = h('p', { class: 'muted dict-status' });
  const list = h('ul', { class: 'dict-list' });
  const more = h('button', { class: 'btn btn-soft', type: 'button', onclick: () => ((shown += CONFIG.PAGE_SIZE), renderList()) }, 'მეტის ჩვენება');

  function renderLetters() {
    const searching = input.value.trim() !== '';
    fill(
      letters,
      manifest.letters.map((l) =>
        h(
          'button',
          {
            class: `letter${!searching && l.k === letter ? ' active' : ''}`,
            type: 'button',
            onclick: () => {
              input.value = '';
              letter = l.k;
              load();
            },
          },
          l.k.toUpperCase(),
          h('small', null, String(l.n))
        )
      )
    );
  }

  function renderList() {
    const part = entries.slice(0, shown);
    fill(list, part.map((e, i) => entryRow(e, i)));
    more.hidden = entries.length <= shown;
    if (!entries.length) {
      status.textContent = manifest.letters.length
        ? input.value.trim()
          ? 'ასეთი სიტყვა ვერ მოიძებნა.'
          : 'ამ ასოზე სიტყვები ჯერ არ არის.'
        : 'ლექსიკონი ჯერ ცარიელია. დაამატე სიტყვები data/words/ -ში და გაუშვი npm run data.';
    } else {
      status.textContent = `${entries.length} სიტყვა`;
    }
  }

  async function load() {
    const mine = ++ticket;
    shown = CONFIG.PAGE_SIZE;
    renderLetters();
    const raw = input.value.trim();
    const q = raw.toLowerCase();
    try {
      let result = [];
      if (q) {
        // ლათინურით ძებნისას ვტვირთავთ მხოლოდ ერთ ასოს, ქართულით — ყველას
        const keys = isLatin(q)
          ? manifest.letters.filter((l) => l.k === baseLetter(q[0])).map((l) => l.k)
          : manifest.letters.map((l) => l.k);
        result = (await Promise.all(keys.map(loadDictLetter))).flat().filter((e) => matches(e, q, raw));
      } else if (letter) {
        result = await loadDictLetter(letter);
      }
      if (mine !== ticket) return;
      entries = result;
    } catch {
      if (mine !== ticket) return;
      entries = [];
      status.textContent = 'ფაილი ვერ ჩაიტვირთა.';
    }
    renderList();
  }

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(load, 180);
  });

  page.append(input, letters, status, list, more);
  load();
  return page;
}
