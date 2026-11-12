import { h } from './utils/dom.js';
import { stopSpeaking } from './utils/audio.js';
import { applyTheme } from './theme.js';
import { route, onRoute, start } from './router.js';
import { renderHeader } from './components/header.js';
import { mountTabbar, setActiveTab } from './components/tabbar.js';
import { mountDevPanel } from './components/devpanel.js';
import { daysPage } from './components/calendar.js';
import { lessonPage } from './components/lesson.js';
import { dictPage } from './components/dict.js';
import { grammarPage, grammarTopicPage } from './components/grammar.js';
import { practiceHub, articlesPage, dictationPage } from './components/practice.js';
import { phoneticsPage } from './components/phonetics.js';
import { initRipple } from './utils/ripple.js';

const view = document.getElementById('view');
const header = document.getElementById('header');

applyTheme();
initRipple();
mountTabbar(document.getElementById('tabbar'));
mountDevPanel(document.getElementById('devpanel'));

route('/days', daysPage);
route('/day/:level/:day', lessonPage);
route('/dict', dictPage);
route('/grammar', grammarPage);
route('/grammar/:level/:id', grammarTopicPage);
route('/practice', practiceHub);
route('/practice/articles', articlesPage);
route('/practice/dictation', dictationPage);
route('/phonetics', phoneticsPage);

function errorView(error) {
  const onFile = location.protocol === 'file:';
  return h(
    'section',
    { class: 'page', dataset: { title: 'შეცდომა' } },
    h(
      'div',
      { class: 'card empty' },
      h('h2', null, 'გვერდი ვერ ჩაიტვირთა'),
      onFile
        ? h('p', { class: 'muted' }, 'საიტი ფაილად გახსენი. JSON ფაილები მუშაობს მხოლოდ სერვერზე. გაუშვი ტერმინალში: npx serve .')
        : h('p', { class: 'muted' }, 'ფაილი ვერ მოიძებნა ან სერვერი არ პასუხობს.'),
      h('code', null, String(error?.message || error))
    )
  );
}

let ticket = 0;
let pageInTimer = 0;
onRoute(async (path, params, handler) => {
  const mine = ++ticket;
  stopSpeaking();
  setActiveTab(path);
  view.classList.add('is-loading');

  let page;
  try {
    page = await handler(params);
  } catch (error) {
    console.error(error);
    page = errorView(error);
  }
  if (mine !== ticket) return; // ამასობაში სხვა გვერდზე გადავიდა

  view.classList.remove('is-loading');
  view.replaceChildren(page);
  renderHeader(header, path, page.dataset?.title);

  view.classList.remove('page-in');
  void view.offsetWidth; // ანიმაციის თავიდან დაწყება
  view.classList.add('page-in');
  window.scrollTo(0, 0);
  clearTimeout(pageInTimer);
  pageInTimer = setTimeout(() => view.classList.remove('page-in'), 900);
});

// ჰედერს ჩრდილი ეძლევა, როცა გვერდი ჩამოსქროლილია
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 6);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

start();
