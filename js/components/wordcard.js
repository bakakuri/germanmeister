import { h, artTag } from '../utils/dom.js';
import { speakBtn } from '../utils/audio.js';

export const POS = {
  noun: 'არსებითი სახელი',
  verb: 'ზმნა',
  adj: 'ზედსართავი',
  adv: 'ზმნიზედა',
  pron: 'ნაცვალსახელი',
  prep: 'წინდებული',
  conj: 'კავშირი',
  num: 'რიცხვითი',
  interj: 'შორისდებული',
  det: 'დეტერმინანტი',
  phrase: 'გამოთქმა',
};

// სიტყვის ბარათი: გერმანული + ქართული ფონეტიკა + თარგმანი + მაგალითი.
export function wordCard(w, { example = true } = {}) {
  const fullDe = w.article ? `${w.article} ${w.de}` : w.de;

  const head = h(
    'div',
    { class: 'wc-head' },
    h('div', { class: 'wc-title' }, artTag(w.article), h('span', { class: 'wc-de' }, w.de)),
    speakBtn(fullDe)
  );

  const meta = h(
    'div',
    { class: 'wc-meta' },
    h('span', { class: 'wc-ph' }, w.ph),
    h('span', { class: 'wc-ka' }, (w.ka || []).join(', '))
  );

  const facts = [];
  if (w.pos) facts.push(h('span', { class: 'tag' }, POS[w.pos] || w.pos));
  if (w.plural) facts.push(h('span', { class: 'tag' }, `მრავლობითი: die ${w.plural}`));
  if (w.forms?.length) facts.push(h('span', { class: 'tag' }, `ფორმები: ${w.forms.join(', ')}`));

  const ex = example && w.example
    ? h(
        'div',
        { class: 'wc-example' },
        h(
          'div',
          { class: 'wc-ex-row' },
          h('p', { class: 'wc-ex-de' }, w.example.de),
          speakBtn(w.example.de, { rate: 0.85 })
        ),
        h('p', { class: 'wc-ex-ph' }, w.example.ph),
        h('p', { class: 'wc-ex-ka' }, w.example.ka)
      )
    : null;

  return h(
    'article',
    { class: 'card wc', dataset: { id: w.id } },
    head,
    meta,
    facts.length ? h('div', { class: 'tags' }, facts) : null,
    w.note ? h('p', { class: 'wc-note' }, w.note) : null,
    ex
  );
}
