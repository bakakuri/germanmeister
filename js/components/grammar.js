import { h, fill, rich } from '../utils/dom.js';
import { speakBtn } from '../utils/audio.js';
import { loadGrammarIndex, loadGrammar } from '../data/loader.js';
import * as state from '../state.js';

/* ---------- თემის გამოსახვა (გაკვეთილებშიც და ცალკე გვერდზეც) ---------- */

// ცხრილის უჯრა: თუ იწყება der/die/das-ით, არტიკლს ფერს ვუცვლით.
function cell(text) {
  const m = String(text).match(/^(der|die|das)(\s.*)?$/i);
  if (!m) return String(text);
  return [h('span', { class: `art art-${m[1].toLowerCase()}` }, m[1]), m[2] || ''];
}

function table(sec) {
  return h(
    'div',
    { class: 'g-table-wrap' },
    h(
      'table',
      { class: 'g-table' },
      sec.caption ? h('caption', null, sec.caption) : null,
      sec.head ? h('thead', null, h('tr', null, sec.head.map((c) => h('th', { scope: 'col' }, c)))) : null,
      h(
        'tbody',
        null,
        sec.rows.map((row) =>
          h('tr', null, row.map((c, i) => (i === 0 ? h('th', { scope: 'row' }, cell(c)) : h('td', null, cell(c)))))
        )
      )
    )
  );
}

function section(sec) {
  switch (sec.type) {
    case 'text':
      return h('p', { class: 'g-text' }, rich(sec.ka));
    case 'tip':
      return h('div', { class: 'g-tip' }, rich(sec.ka));
    case 'list':
      return h('ul', { class: 'g-list' }, sec.items.map((i) => h('li', null, rich(i))));
    case 'table':
      return table(sec);
    default:
      return null;
  }
}

const levelOf = (id) => (id.split('-')[1] || 'a1').toLowerCase();

function topicLinks(label, ids, titles) {
  if (!ids?.length) return null;
  return h(
    'div',
    { class: 'g-links' },
    h('span', { class: 'muted' }, label),
    ids.map((id) =>
      h('a', { class: 'chip-link', href: `#/grammar/${levelOf(id)}/${id}` }, titles?.[id] || id)
    )
  );
}

// options.titles — { id: სათაური }; თუ გადაეცემა, ჩანს "ჯერ ისწავლე / შემდეგი" ბმულები.
export function renderTopic(t, { showTitle = true, titles = null } = {}) {
  return h(
    'article',
    { class: 'g-topic' },
    showTitle ? h('h2', { class: 'g-title' }, t.title) : h('h3', { class: 'g-title g-title-sm' }, t.title),
    t.summary ? h('p', { class: 'g-summary' }, rich(t.summary)) : null,
    (t.sections || []).map(section),
    t.examples?.length
      ? h(
          'div',
          { class: 'g-block' },
          h('h3', null, 'მაგალითები'),
          h(
            'ul',
            { class: 'g-examples' },
            t.examples.map((ex) =>
              h(
                'li',
                null,
                h('div', { class: 'g-ex-main' }, h('p', { class: 'g-ex-de' }, ex.de), speakBtn(ex.de, { rate: 0.85 })),
                h('p', { class: 'g-ex-ph' }, ex.ph),
                h('p', { class: 'g-ex-ka' }, ex.ka)
              )
            )
          )
        )
      : null,
    t.mistakes?.length
      ? h(
          'div',
          { class: 'g-block' },
          h('h3', null, 'ხშირი შეცდომები'),
          h(
            'ul',
            { class: 'g-mistakes' },
            t.mistakes.map((m) =>
              h(
                'li',
                null,
                h('p', { class: 'm-wrong' }, m.wrong),
                h('p', { class: 'm-right' }, m.right),
                m.why ? h('p', { class: 'm-why' }, m.why) : null
              )
            )
          )
        )
      : null,
    titles ? topicLinks('ჯერ ისწავლე:', t.requires, titles) : null,
    titles ? topicLinks('შემდეგი:', t.next, titles) : null
  );
}

/* ---------- გვერდები ---------- */

export async function grammarPage() {
  const index = await loadGrammarIndex();
  const page = h('section', { class: 'page grammar-page', dataset: { title: 'გრამატიკა' } });
  const levels = [...new Set(index.topics.map((t) => t.level))];
  const count = (l) => index.topics.filter((t) => t.level === l).length;
  let level = levels.includes(state.get().level) ? state.get().level : levels[0];

  const input = h('input', {
    class: 'inp search',
    type: 'search',
    placeholder: `მოძებნე თემა (${index.topics.length})`,
    'aria-label': 'გრამატიკის ძებნა',
  });
  const chips = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'დონე' });
  const list = h('div', { class: 'g-groups' });

  const row = (t) =>
    h(
      'li',
      null,
      h(
        'a',
        { class: 'g-row', href: `#/grammar/${t.level.toLowerCase()}/${t.id}` },
        h('span', { class: 'g-row-title' }, t.title),
        input.value.trim() ? h('span', { class: 'tag' }, t.level) : null
      )
    );

  function drawChips() {
    const searching = input.value.trim() !== '';
    fill(
      chips,
      levels.map((l) =>
        h(
          'button',
          {
            class: `lvl${!searching && l === level ? ' active' : ''}`,
            type: 'button',
            onclick: () => {
              input.value = '';
              level = l;
              state.setLevel(l);
              draw();
            },
          },
          h('strong', null, l),
          h('small', null, String(count(l)))
        )
      )
    );
  }

  function draw() {
    drawChips();
    const q = input.value.trim().toLowerCase();
    const topics = q
      ? index.topics.filter((t) => `${t.title} ${t.category || ''}`.toLowerCase().includes(q))
      : index.topics.filter((t) => t.level === level);

    if (!topics.length) {
      fill(list, h('div', { class: 'card empty' }, h('p', { class: 'muted' }, q ? 'ასეთი თემა ვერ მოიძებნა.' : 'ამ დონეზე გრამატიკა ჯერ არ არის დამატებული.')));
      return;
    }
    // კატეგორიებად დაჯგუფება (თანმიმდევრობა ინარჩუნებს პირველ გამოჩენას)
    const cats = new Map();
    topics.forEach((t) => {
      const key = q ? 'შედეგები' : t.category || 'სხვა';
      cats.set(key, [...(cats.get(key) || []), t]);
    });
    fill(
      list,
      [...cats].map(([cat, items]) =>
        h(
          'section',
          { class: 'card g-group' },
          h('h2', null, cat, h('small', null, `${items.length}`)),
          h('ul', null, items.map(row))
        )
      )
    );
  }

  input.addEventListener('input', draw);
  page.append(input, chips, list);
  draw();
  return page;
}

export async function grammarTopicPage({ level, id }) {
  const [topic, index] = await Promise.all([loadGrammar(level, id), loadGrammarIndex().catch(() => ({ topics: [] }))]);
  const titles = Object.fromEntries(index.topics.map((t) => [t.id, t.title]));
  return h(
    'section',
    { class: 'page grammar-topic', dataset: { title: 'გრამატიკა' } },
    h('div', { class: 'card' }, renderTopic(topic, { titles }))
  );
}
