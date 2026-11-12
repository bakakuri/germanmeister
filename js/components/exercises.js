import { h, fill as setKids, shuffle } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { speakBtn } from '../utils/audio.js';

// შედარებისას უგულებელვყოფთ რეგისტრს, სასვენ ნიშნებს და ზედმეტ გამოტოვებებს.
const norm = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"„“]/g, '')
    .replace(/\s+/g, ' ');

function feedback(fb, ok, answer, explain) {
  fb.className = `fb show ${ok ? 'ok' : 'bad'}`;
  setKids(
    fb,
    h('strong', null, ok ? 'სწორია!' : 'სწორი პასუხი:'),
    ok ? null : ' ',
    ok ? null : h('span', { class: 'ans' }, answer),
    explain ? h('p', { class: 'why' }, explain) : null
  );
}

/* ---------- ტიპები ----------
   თითო ფუნქცია აბრუნებს { el } და პირველი შემოწმებისას იძახებს report(ok)-ს */

function choice(ex, report) {
  let done = false;
  const fb = h('div', { class: 'fb', role: 'status' });
  const buttons = ex.options.map((text, i) =>
    h('button', { class: 'opt', type: 'button', onclick: () => pick(i) }, text)
  );
  function pick(i) {
    if (done) return;
    done = true;
    buttons.forEach((b, j) => {
      b.disabled = true;
      if (j === ex.answer) b.classList.add('is-right');
      else if (j === i) b.classList.add('is-wrong');
    });
    const ok = i === ex.answer;
    feedback(fb, ok, ex.options[ex.answer], ex.explain);
    report(ok);
  }
  return { el: h('article', { class: 'ex' }, h('p', { class: 'ex-q' }, ex.q), h('div', { class: 'opts' }, buttons), fb) };
}

function fill(ex, report) {
  let done = false;
  const answers = [].concat(ex.answer);
  const fb = h('div', { class: 'fb', role: 'status' });
  const input = h('input', {
    class: 'inp',
    type: 'text',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    placeholder: 'ჩაწერე პასუხი',
    'aria-label': 'პასუხი',
  });
  const btn = h('button', { class: 'btn btn-soft', type: 'button', onclick: check }, 'შემოწმება');
  input.addEventListener('keydown', (e) => e.key === 'Enter' && check());
  function check() {
    if (done || !input.value.trim()) return;
    done = true;
    const ok = answers.some((a) => norm(a) === norm(input.value));
    input.disabled = btn.disabled = true;
    input.classList.add(ok ? 'is-right' : 'is-wrong');
    feedback(fb, ok, answers[0], ex.explain);
    report(ok);
  }
  return {
    el: h(
      'article',
      { class: 'ex' },
      h('p', { class: 'ex-q' }, ex.q),
      ex.hint ? h('p', { class: 'ex-hint' }, ex.hint) : null,
      h('div', { class: 'row' }, input, btn),
      fb
    ),
  };
}

function order(ex, report) {
  let done = false;
  const fb = h('div', { class: 'fb', role: 'status' });
  const pool = h('div', { class: 'chips pool' });
  const line = h('div', { class: 'chips line', 'aria-label': 'შენი წინადადება' });
  const move = (b) => {
    if (done) return;
    (b.parentElement === pool ? line : pool).append(b);
    b.classList.remove('moved');
    void b.offsetWidth;
    b.classList.add('moved');
  };
  const words = ex.shuffle === false ? ex.words : shuffle(ex.words);
  words.forEach((w) => pool.append(h('button', { class: 'chip', type: 'button', onclick: (e) => move(e.currentTarget) }, w)));
  const btn = h('button', { class: 'btn btn-soft', type: 'button', onclick: check }, 'შემოწმება');
  function check() {
    if (done || !line.children.length) return;
    done = true;
    btn.disabled = true;
    const got = [...line.children].map((b) => b.textContent).join(' ');
    const ok = norm(got) === norm(ex.answer);
    line.classList.add(ok ? 'is-right' : 'is-wrong');
    feedback(fb, ok, ex.answer, ex.explain);
    report(ok);
  }
  return {
    el: h('article', { class: 'ex' }, h('p', { class: 'ex-q' }, ex.q || 'დააწყვე წინადადება'), line, pool, h('div', { class: 'row' }, btn), fb),
  };
}

function article(ex, report) {
  let done = false;
  const fb = h('div', { class: 'fb', role: 'status' });
  const buttons = ['der', 'die', 'das'].map((a) =>
    h('button', { class: `art-btn art-${a}`, type: 'button', onclick: () => pick(a) }, a)
  );
  function pick(a) {
    if (done) return;
    done = true;
    buttons.forEach((b) => {
      b.disabled = true;
      if (b.textContent === ex.answer) b.classList.add('is-right');
      else if (b.textContent === a) b.classList.add('is-wrong');
    });
    const ok = a === ex.answer;
    feedback(fb, ok, `${ex.answer} ${ex.word}`, ex.explain);
    report(ok);
  }
  return {
    el: h(
      'article',
      { class: 'ex ex-article' },
      h('p', { class: 'ex-q' }, ex.q || 'რომელი არტიკლია?'),
      h('div', { class: 'ex-word' }, h('strong', null, ex.word), ex.ka ? h('span', null, ex.ka) : null, speakBtn(ex.word)),
      h('div', { class: 'art-btns' }, buttons),
      fb
    ),
  };
}

function dictation(ex, report) {
  let done = false;
  const fb = h('div', { class: 'fb', role: 'status' });
  const input = h('input', {
    class: 'inp',
    type: 'text',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    placeholder: 'რაც გაიგონე, ჩაწერე',
    'aria-label': 'დიქტანტი',
  });
  const btn = h('button', { class: 'btn btn-soft', type: 'button', onclick: check }, 'შემოწმება');
  input.addEventListener('keydown', (e) => e.key === 'Enter' && check());
  function check() {
    if (done || !input.value.trim()) return;
    done = true;
    const ok = norm(input.value) === norm(ex.de);
    input.disabled = btn.disabled = true;
    input.classList.add(ok ? 'is-right' : 'is-wrong');
    feedback(fb, ok, ex.de, ex.explain);
    fb.append(
      ex.ph ? h('p', { class: 'why' }, ex.ph) : null,
      ex.ka ? h('p', { class: 'why' }, ex.ka) : null
    );
    report(ok);
  }
  return {
    el: h(
      'article',
      { class: 'ex ex-dictation' },
      h('p', { class: 'ex-q' }, ex.q || 'მოუსმინე და ჩაწერე'),
      h('div', { class: 'row' }, speakBtn(ex.de, { caption: 'მოსმენა' }), speakBtn(ex.de, { rate: 0.5, caption: 'ნელა', slow: true })),
      h('div', { class: 'row' }, input, btn),
      fb
    ),
  };
}

export const makers = { choice, fill, order, article, dictation };

function make(ex, report) {
  const maker = makers[ex.type];
  if (!maker) return { el: h('p', { class: 'muted' }, `უცნობი სავარჯიშოს ტიპი: ${ex.type}`) };
  return maker(ex, report);
}

/* სია — ყველა სავარჯიშო ერთად (გაკვეთილის გვერდზე) */
export function exerciseList(list) {
  let answered = 0;
  let right = 0;
  const score = h('p', { class: 'ex-score' }, `0 / ${list.length}`);
  const items = list.map((ex) =>
    make(ex, (ok) => {
      answered++;
      if (ok) right++;
      score.textContent = `${right} / ${list.length} სწორია`;
      score.classList.toggle('done', answered === list.length);
    }).el
  );
  return h('div', { class: 'ex-list' }, items, score);
}

/* სესია — ერთი სავარჯიშო ეკრანზე, ბოლოს შედეგი (პრაქტიკის გვერდებზე) */
export function session(items, { onAgain } = {}) {
  const root = h('div', { class: 'session' });
  let i = 0;
  let right = 0;

  function show() {
    if (i >= items.length) return finish();
    let answered = false;
    const next = h(
      'button',
      {
        class: 'btn btn-primary',
        type: 'button',
        disabled: true,
        onclick: () => {
          i++;
          show();
        },
      },
      i === items.length - 1 ? 'დასრულება' : 'შემდეგი'
    );
    const made = make(items[i], (ok) => {
      if (answered) return;
      answered = true;
      if (ok) right++;
      next.disabled = false;
    });
    root.replaceChildren(
      h(
        'div',
        { class: 'sess-top' },
        h('span', null, `${i + 1} / ${items.length}`),
        h('div', { class: 'prog' }, h('div', { class: 'prog-bar', style: { width: `${(i / items.length) * 100}%` } }))
      ),
      made.el,
      h('div', { class: 'sess-actions' }, next)
    );
  }

  function finish() {
    root.replaceChildren(
      h(
        'div',
        { class: 'card result' },
        h('div', { class: 'result-badge' }, icon('check', 30)),
        h('h2', null, `${right} / ${items.length}`),
        h('p', { class: 'muted' }, right === items.length ? 'ყველა სწორია.' : 'ხელახლა სცადე — შედეგი გაუმჯობესდება.'),
        onAgain ? h('button', { class: 'btn btn-primary', type: 'button', onclick: onAgain }, 'ხელახლა') : null
      )
    );
  }

  show();
  return root;
}
