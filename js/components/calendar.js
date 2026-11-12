import { h, s, fill, artTag, toast, countUp } from '../utils/dom.js';
import { loadIndex, loadPlan } from '../data/loader.js';
import { go } from '../router.js';
import * as state from '../state.js';

const COLORS = { review: 'sun', words: 'lav', grammar: 'sky', exercises: 'mint', listening: 'peach', writing: 'rose' };
const RANGE = 30; // თითო გვერდზე 30 დღე — საიტი სიგრძეში მოკლე რჩება
const R = 26;
const CIRC = 2 * Math.PI * R;

function hero(level, info, learned, nextDay) {
  const pct = Math.round((learned / info.days) * 100);

  const arc = s('circle', { class: 'ring-arc', cx: 32, cy: 32, r: R, 'stroke-dasharray': CIRC, 'stroke-dashoffset': CIRC });
  const ring = s('svg', { class: 'ring', viewBox: '0 0 64 64', 'aria-hidden': 'true' }, s('circle', { class: 'ring-bg', cx: 32, cy: 32, r: R }), arc);
  const num = h('span', { class: 'ring-num' }, '0%');
  requestAnimationFrame(() => {
    arc.style.strokeDashoffset = String(CIRC * (1 - pct / 100));
    countUp(num, pct, { suffix: '%' });
  });

  const ready = info.ready.length > 0;
  const btn = h(
    'button',
    {
      class: 'btn btn-primary',
      type: 'button',
      onclick: () => (ready || info.ready.includes(nextDay) ? go(`/day/${level}/${nextDay}`) : toast('ამ დონის დღეები ჯერ ცარიელია')),
    },
    learned >= info.days ? 'გავიმეორო' : learned === 0 ? 'დავიწყოთ · დღე 1' : `გაგრძელება · დღე ${nextDay}`
  );

  return h(
    'section',
    { class: 'card hero' },
    h('div', { class: 'ring-wrap' }, ring, num),
    h('div', { class: 'hero-text' }, h('p', { class: 'hero-level' }, `${level} · ${info.title}`), h('p', { class: 'hero-count' }, `${learned} / ${info.days} დღე`), btn),
    h('div', { class: 'hero-art', 'aria-hidden': 'true' }, artTag('der'), artTag('die'), artTag('das'))
  );
}

function levelChips(index, level, onPick) {
  return h(
    'div',
    { class: 'chip-row', role: 'group', 'aria-label': 'დონე' },
    index.levels.map((l) =>
      h(
        'button',
        { class: `lvl${l.id === level ? ' active' : ''}`, type: 'button', onclick: () => onPick(l.id) },
        h('strong', null, l.id),
        h('small', null, `${l.ready.length}/${l.days}`)
      )
    )
  );
}

function planCard(plan, minutes, onPick) {
  const blocks = plan.blocks.map((b) => ({ ...b, m: b.min[String(minutes)] || 0 })).filter((b) => b.m > 0);
  const total = blocks.reduce((a, b) => a + b.m, 0);
  return h(
    'section',
    { class: 'card plan' },
    h(
      'div',
      { class: 'plan-top' },
      h('h2', null, `დღის გეგმა · ${total} წთ`),
      h(
        'div',
        { class: 'seg-control', role: 'group', 'aria-label': 'დრო დღეში' },
        plan.modes.map((m) => h('button', { class: m === minutes ? 'active' : '', type: 'button', onclick: () => onPick(m) }, `${m}`))
      )
    ),
    h('div', { class: 'planbar', 'aria-hidden': 'true' }, blocks.map((b) => h('span', { class: `seg seg-${COLORS[b.id] || 'lav'}`, style: `flex-grow:${b.m}` }))),
    h(
      'ul',
      { class: 'plan-legend' },
      blocks.map((b) => h('li', null, h('i', { class: `dot seg-${COLORS[b.id] || 'lav'}` }), h('span', null, b.title), h('b', null, `${b.m}′`)))
    )
  );
}

function calendarCard(level, info, rangeIdx, nextDay, onRange) {
  const ranges = Math.ceil(info.days / RANGE);
  const from = rangeIdx * RANGE + 1;
  const to = Math.min(info.days, from + RANGE - 1);

  const cells = [];
  for (let d = from; d <= to; d++) {
    const learned = state.isLearned(level, d);
    const ready = info.ready.includes(d);
    const cls = learned ? 'learned' : ready ? 'ready' : 'empty';
    cells.push(
      h(
        'button',
        {
          class: `cell ${cls}${d === nextDay ? ' next' : ''}`,
          type: 'button',
          style: `--i:${d - from}`,
          'aria-label': `დღე ${d}${learned ? ', ნასწავლია' : ready ? '' : ', ცარიელია'}`,
          onclick: () => (ready ? go(`/day/${level}/${d}`) : toast(`დღე ${d} ჯერ ცარიელია. დაამატე data/ საქაღალდეში`)),
        },
        String(d)
      )
    );
  }

  return h(
    'section',
    { class: 'card cal' },
    h(
      'div',
      { class: 'cal-head' },
      h('h2', null, 'დღეები'),
      ranges > 1
        ? h(
            'div',
            { class: 'range-row', role: 'group', 'aria-label': 'დღეების გვერდი' },
            Array.from({ length: ranges }, (_, i) =>
              h(
                'button',
                { class: `rng${i === rangeIdx ? ' active' : ''}`, type: 'button', onclick: () => onRange(i) },
                `${i * RANGE + 1}–${Math.min(info.days, (i + 1) * RANGE)}`
              )
            )
          )
        : null
    ),
    h('div', { class: 'cal-grid' }, cells),
    h(
      'ul',
      { class: 'cal-legend' },
      h('li', null, h('i', { class: 'swatch learned' }), 'ნასწავლი'),
      h('li', null, h('i', { class: 'swatch ready' }), 'მზადაა'),
      h('li', null, h('i', { class: 'swatch empty' }), 'ცარიელი')
    )
  );
}

export async function daysPage() {
  const [index, plan] = await Promise.all([loadIndex(), loadPlan()]);
  const page = h('section', { class: 'page days-page', dataset: { title: 'დღეები' } });

  let level = index.levels.some((l) => l.id === state.get().level) ? state.get().level : index.levels[0].id;
  let rangeIdx = null;

  function nextDayOf(info) {
    for (let d = 1; d <= info.days; d++) if (!state.isLearned(level, d) && info.ready.includes(d)) return d;
    for (let d = 1; d <= info.days; d++) if (!state.isLearned(level, d)) return d;
    return 1;
  }

  function draw() {
    const info = index.levels.find((l) => l.id === level);
    const nextDay = nextDayOf(info);
    if (rangeIdx == null) rangeIdx = Math.floor((nextDay - 1) / RANGE);
    const learned = state.countLearned(level);
    fill(
      page,
      hero(level, info, learned, nextDay),
      levelChips(index, level, (id) => {
        level = id;
        rangeIdx = null;
        state.setLevel(id);
        draw();
      }),
      planCard(plan, state.get().minutes, (m) => {
        state.setMinutes(m);
        draw();
      }),
      calendarCard(level, info, rangeIdx, nextDay, (i) => {
        rangeIdx = i;
        draw();
      })
    );
  }

  draw();
  return page;
}
