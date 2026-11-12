import { CONFIG } from '../config.js';
import { h, fill, shuffle } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { loadPracticeManifest, loadPracticeNouns, loadPracticeSentences } from '../data/loader.js';
import { session } from './exercises.js';
import { go } from '../router.js';
import * as state from '../state.js';

// პრაქტიკისთვის აქტიური დონე: თუ არჩეულ დონეზე მასალა არ არის, პირველ ხელმისაწვდომს ვიღებთ.
function activeLevel(manifest) {
  const wanted = state.get().level;
  const have = Object.keys(manifest.levels);
  return have.includes(wanted) ? wanted : have[0] || null;
}

function emptyPractice() {
  return h(
    'div',
    { class: 'card empty' },
    h('h2', null, 'პრაქტიკის მასალა ჯერ არ არის'),
    h('p', { class: 'muted' }, 'დაამატე სიტყვები data/words/ -ში და გაუშვი npm run data.')
  );
}

export async function practiceHub() {
  const manifest = await loadPracticeManifest();
  const page = h('section', { class: 'page practice-page', dataset: { title: 'პრაქტიკა' } });
  const levels = Object.keys(manifest.levels);

  const draw = () => {
    const level = activeLevel(manifest);
    if (!level) return page.replaceChildren(emptyPractice());
    const info = manifest.levels[level];
    fill(
      page,
      levels.length > 1
        ? h(
            'div',
            { class: 'chip-row' },
            levels.map((l) =>
              h(
                'button',
                {
                  class: `lvl${l === level ? ' active' : ''}`,
                  type: 'button',
                  onclick: () => {
                    state.setLevel(l);
                    draw();
                  },
                },
                h('strong', null, l)
              )
            )
          )
        : null,
      h(
        'button',
        { class: 'card game', type: 'button', disabled: !info.nouns, onclick: () => go('/practice/articles') },
        h('span', { class: 'game-art' }, h('i', { class: 'art art-der' }, 'der'), h('i', { class: 'art art-die' }, 'die'), h('i', { class: 'art art-das' }, 'das')),
        h('h2', null, 'არტიკლების ტრენაჟორი'),
        h('p', { class: 'muted' }, info.nouns ? `${info.nouns} არსებითი სახელი · ${level}` : 'არსებითი სახელები ჯერ არ არის')
      ),
      h(
        'button',
        { class: 'card game', type: 'button', disabled: !info.sentences, onclick: () => go('/practice/dictation') },
        h('span', { class: 'game-ico' }, icon('speaker', 28)),
        h('h2', null, 'დიქტანტი'),
        h('p', { class: 'muted' }, info.sentences ? `${info.sentences} წინადადება · ${level}` : 'წინადადებები ჯერ არ არის')
      )
    );
  };

  draw();
  return page;
}

async function runPage(kind) {
  const manifest = await loadPracticeManifest();
  const level = activeLevel(manifest);
  const page = h('section', { class: `page practice-run`, dataset: { title: kind === 'articles' ? 'არტიკლები' : 'დიქტანტი' } });
  if (!level) {
    page.append(emptyPractice());
    return page;
  }

  const data = await (kind === 'articles' ? loadPracticeNouns(level) : loadPracticeSentences(level));
  if (!data.length) {
    page.append(emptyPractice());
    return page;
  }

  const start = () => {
    const picked = shuffle(data).slice(0, CONFIG.PRACTICE_ROUNDS);
    const items =
      kind === 'articles'
        ? picked.map((n) => ({ type: 'article', word: n.de, answer: n.article, ka: (n.ka || []).join(', ') }))
        : picked.map((s) => ({ type: 'dictation', de: s.de, ph: s.ph, ka: s.ka }));
    page.replaceChildren(session(items, { onAgain: start }));
  };
  start();
  return page;
}

export const articlesPage = () => runPage('articles');
export const dictationPage = () => runPage('dictation');
