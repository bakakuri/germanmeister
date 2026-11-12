import { h, fill } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { speakBtn } from '../utils/audio.js';
import { loadPhonetics } from '../data/loader.js';

function item(it) {
  return h(
    'li',
    { class: 'ph-item' },
    h('div', { class: 'ph-key' }, h('b', null, it.de), h('span', null, it.ph)),
    h(
      'div',
      { class: 'ph-body' },
      it.note ? h('p', null, it.note) : null,
      it.example
        ? h(
            'div',
            { class: 'ph-example' },
            h('span', { class: 'ph-ex-de' }, it.example.de),
            h('span', { class: 'ph-ex-ph' }, it.example.ph),
            speakBtn(it.example.de),
            h('span', { class: 'ph-ex-ka' }, it.example.ka)
          )
        : null
    )
  );
}

// აკორდეონი: ერთდროულად ერთი ჯგუფია ღია, გვერდი მოკლე რჩება
function group(g, open, onToggle) {
  const card = h('section', { class: `card acc${open ? ' open' : ''}` });
  const head = h(
    'button',
    { class: 'acc-head', type: 'button', 'aria-expanded': String(open), onclick: () => onToggle(card) },
    h('h2', null, g.title, h('small', null, `${g.items.length}`)),
    h('span', { class: 'chev' }, icon('back', 20))
  );
  card.append(head, h('div', { class: 'acc-body' }, h('div', { class: 'acc-in' }, g.note ? h('p', { class: 'muted' }, g.note) : null, h('ul', { class: 'ph-list' }, g.items.map(item)))));
  return card;
}

export async function phoneticsPage() {
  const data = await loadPhonetics();
  const page = h('section', { class: 'page phonetics-page', dataset: { title: 'ბგერები' } });
  const cards = [];

  const toggle = (card) => {
    const willOpen = !card.classList.contains('open');
    cards.forEach((c) => {
      c.classList.remove('open');
      c.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      card.classList.add('open');
      card.querySelector('.acc-head').setAttribute('aria-expanded', 'true');
    }
  };

  data.groups.forEach((g) => cards.push(group(g, false, toggle)));
  fill(page, h('section', { class: 'card intro-card' }, h('p', { class: 'muted' }, data.intro)), cards);
  return page;
}
