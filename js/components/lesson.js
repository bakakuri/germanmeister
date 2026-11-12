import { h, fill, toast } from '../utils/dom.js';
import { speakBtn, speakSequence, stopSpeaking } from '../utils/audio.js';
import { icon } from '../utils/icons.js';
import { burstAt } from '../utils/confetti.js';
import { loadIndex, loadPlan, loadDay, loadWords, loadGrammar, loadExercises, prefetch } from '../data/loader.js';
import { carousel } from './carousel.js';
import { wordCard } from './wordcard.js';
import { renderTopic } from './grammar.js';
import { exerciseList } from './exercises.js';
import { go } from '../router.js';
import * as state from '../state.js';

const COLORS = { review: 'sun', words: 'lav', grammar: 'sky', exercises: 'mint', listening: 'peach', writing: 'rose' };

/* ---------- ეტაპების შიგთავსი ---------- */

// გამეორება: გადასაბრუნებელი ბარათები გუშინდელი სიტყვებით
function reviewPanel(words) {
  const cards = words.map((w) => {
    const front = (w.article ? `${w.article} ` : '') + w.de;
    const el = h(
      'button',
      { class: 'flash', type: 'button', 'aria-label': `${front} — გადაატრიალე` },
      h('span', { class: 'flash-in' }, h('span', { class: 'flash-front' }, front), h('span', { class: 'flash-back' }, (w.ka || []).join(', ')))
    );
    el.addEventListener('click', () => el.classList.toggle('open'));
    return el;
  });
  return [h('p', { class: 'muted' }, 'გუშინდელი სიტყვები: გაიხსენე და ბარათზე დააჭირე.'), h('div', { class: 'flashes' }, cards)];
}

function wordsPanel(words) {
  return [carousel(words.map((w) => wordCard(w)), { label: 'ახალი სიტყვები' })];
}

function grammarPanel(topics) {
  return topics.map((t, i) => renderTopic(t, { showTitle: i === 0 && topics.length === 1 ? true : false }));
}

function listeningPanel(reading) {
  const lines = reading.lines || [];
  const playAll = h(
    'button',
    {
      class: 'btn btn-soft',
      type: 'button',
      onclick: () => {
        speakSequence(lines.map((l) => l.de), 0.88);
      },
    },
    icon('speaker', 18),
    ' მოვუსმინო მთლიანად'
  );
  return [
    h('h3', { class: 'sec-sub' }, reading.title || 'დიალოგი'),
    h(
      'div',
      { class: 'dialogue' },
      lines.map((l) =>
        h(
          'div',
          { class: 'dlg-line' },
          h('span', { class: 'dlg-who' }, l.speaker || ''),
          h('div', { class: 'dlg-body' }, h('p', { class: 'dlg-de' }, l.de), h('p', { class: 'dlg-ph' }, l.ph), h('p', { class: 'dlg-ka' }, l.ka)),
          speakBtn(l.de, { rate: 0.85 })
        )
      )
    ),
    playAll,
  ];
}

function writingPanel(writing) {
  return [
    h('p', { class: 'wr-task' }, writing.task),
    writing.example ? h('div', { class: 'wr-example' }, h('p', { class: 'muted' }, 'მაგალითი'), h('p', null, writing.example)) : null,
    h('textarea', { class: 'inp', rows: '3', placeholder: 'დაწერე აქ…', 'aria-label': 'შენი წერილობითი პასუხი', style: 'height:auto;padding:10px 12px;resize:vertical' }),
  ];
}

/* ---------- გვერდი ---------- */

function emptyDay(level, day, prevReady) {
  return h(
    'section',
    { class: 'page', dataset: { title: `დღე ${day}` } },
    h(
      'div',
      { class: 'card empty' },
      h('h2', null, `${level} · დღე ${day} ჯერ ცარიელია`),
      h('p', { class: 'muted' }, `დაამატე data/days/${level.toLowerCase()}/day-${String(day).padStart(3, '0')}.json და გაუშვი npm run data.`),
      h('a', { class: 'btn btn-soft', href: '#/days' }, 'დღეების სიაში'),
      prevReady ? h('a', { class: 'btn btn-primary', href: `#/day/${level}/${day - 1}` }, `დღე ${day - 1}`) : null
    )
  );
}

export async function lessonPage({ level, day: dayParam }) {
  level = String(level).toUpperCase();
  const dayNo = Number(dayParam);
  const [index, plan] = await Promise.all([loadIndex(), loadPlan()]);
  const info = index.levels.find((l) => l.id === level);
  if (!info || !info.ready.includes(dayNo)) return emptyDay(level, dayNo, info?.ready.includes(dayNo - 1));

  let day;
  try {
    day = await loadDay(level, dayNo);
  } catch {
    return emptyDay(level, dayNo, info.ready.includes(dayNo - 1));
  }

  const hasPrev = dayNo > 1 && info.ready.includes(dayNo - 1);
  const hasNext = info.ready.includes(dayNo + 1);

  const [words, grammarTopics, exercises, prevWords] = await Promise.all([
    loadWords(level, dayNo).catch(() => []),
    Promise.all((day.grammar || []).map((id) => loadGrammar(level, id).catch(() => null))).then((l) => l.filter(Boolean)),
    day.exercises ? loadExercises(level, dayNo).catch(() => []) : [],
    hasPrev ? loadWords(level, dayNo - 1).catch(() => []) : [],
  ]);

  if (hasNext) prefetch(() => loadDay(level, dayNo + 1), () => loadWords(level, dayNo + 1), () => loadExercises(level, dayNo + 1));

  const orderedWords = day.words?.length ? day.words.map((id) => words.find((w) => w.id === id)).filter(Boolean) : words;

  // ეტაპები: გეგმის ბლოკები არჩეული დროისთვის; ცარიელს ვტოვებთ
  const minutes = String(state.get().minutes);
  const content = {
    review: prevWords.length ? () => reviewPanel(prevWords) : null,
    words: orderedWords.length ? () => wordsPanel(orderedWords) : null,
    grammar: grammarTopics.length ? () => grammarPanel(grammarTopics) : null,
    exercises: exercises.length ? () => [exerciseList(exercises)] : null,
    listening: day.reading?.lines?.length ? () => listeningPanel(day.reading) : null,
    writing: day.writing ? () => writingPanel(day.writing) : null,
  };
  const steps = plan.blocks
    .filter((b) => (b.min[minutes] || 0) > 0 && content[b.id])
    .map((b) => ({ id: b.id, title: b.title, min: b.min[minutes], build: content[b.id], el: null }));

  const page = h('section', { class: 'page lesson-page', dataset: { title: `დღე ${dayNo}` } });

  const intro = h(
    'div',
    { class: 'lesson-intro' },
    h('p', { class: 'lesson-kicker' }, `${level} · დღე ${dayNo}`),
    h('h1', { class: 'lesson-title' }, day.title),
    day.intro ? h('p', { class: 'lesson-lead' }, day.intro) : null
  );

  if (!steps.length) {
    page.append(intro, h('div', { class: 'card empty' }, h('p', { class: 'muted' }, 'ამ დღეს ჯერ მასალა არ აქვს.')));
    return page;
  }

  /* ეტაპების ზოლი */
  const pills = steps.map((st, i) =>
    h(
      'button',
      { class: 'step', type: 'button', onclick: () => show(i) },
      h('i', { class: `dot seg-${COLORS[st.id] || 'lav'}` }),
      st.title,
      h('small', null, `${st.min}′`)
    )
  );
  const track = h('div', { class: 'steps', role: 'tablist' }, pills);
  const bar = h('i');
  const stepbar = h('div', { class: 'stepbar' }, track, h('div', { class: 'step-progress' }, bar));

  const stage = h('div', { class: 'stage' });
  const foot = h('div', { class: 'panel-foot' });
  const visited = new Set();
  let current = -1;

  function panelFor(i) {
    const st = steps[i];
    if (!st.el) {
      st.el = h('div', { class: 'panel' }, h('div', { class: 'card panel-card' }, h('div', { class: 'panel-body' }, st.build())));
    }
    return st.el;
  }

  function finishButton() {
    const learned = state.isLearned(level, dayNo);
    const btn = h(
      'button',
      { class: `btn btn-finish${learned ? ' is-learned' : ''}`, type: 'button' },
      icon('check', 20),
      h('span', null, learned ? 'დღე დასრულებულია' : 'დღე დავასრულე')
    );
    btn.addEventListener('click', () => {
      const on = state.toggleLearned(level, dayNo);
      btn.classList.toggle('is-learned', on);
      btn.lastChild.textContent = on ? 'დღე დასრულებულია' : 'დღე დავასრულე';
      if (on) {
        burstAt(btn, 44);
        toast(hasNext ? 'ყოჩაღ! ხვალ შემდეგი დღეა' : 'ყოჩაღ! დღე დასრულდა');
      }
    });
    return btn;
  }

  function drawFoot() {
    const last = current === steps.length - 1;
    const back = h('button', { class: 'btn btn-soft', type: 'button', disabled: current === 0, onclick: () => show(current - 1) }, 'უკან');
    const next = last
      ? null
      : h('button', { class: 'btn btn-primary btn-next', type: 'button', onclick: () => show(current + 1) }, 'შემდეგი');
    fill(
      foot,
      last ? finishButton() : null,
      h('div', { class: 'day-nav' }, back, last ? (hasNext ? h('a', { class: 'btn btn-soft', href: `#/day/${level}/${dayNo + 1}` }, `დღე ${dayNo + 1}`) : h('a', { class: 'btn btn-soft', href: '#/days' }, 'დღეები')) : next)
    );
  }

  function show(i) {
    if (i === current || i < 0 || i >= steps.length) return;
    const dir = i > current ? 'fwd' : 'back';
    const first = current === -1;
    stopSpeaking();
    current = i;
    visited.add(i);

    const panel = panelFor(i);
    panel.classList.remove('fwd', 'back');
    void panel.offsetWidth;
    if (!first) panel.classList.add(dir);
    stage.replaceChildren(panel);

    pills.forEach((p, k) => {
      p.classList.toggle('active', k === i);
      p.classList.toggle('done', visited.has(k) && k !== i);
      p.setAttribute('aria-selected', String(k === i));
    });
    bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    const pill = pills[i];
    track.scrollTo({ left: pill.offsetLeft - (track.clientWidth - pill.offsetWidth) / 2, behavior: first ? 'auto' : 'smooth' });

    drawFoot();
    // კარუსელი ზომებს მხოლოდ გამოჩენის შემდეგ ითვლის
    panel.querySelectorAll('.car-track').forEach((t) => t.dispatchEvent(new Event('scroll')));
    if (!first) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  page.append(intro, stepbar, stage, foot);
  show(0);
  return page;
}
