import { h } from '../utils/dom.js';
import { icon } from '../utils/icons.js';

const TABS = [
  { id: 'days', label: 'დღეები', href: '#/days', icon: 'days' },
  { id: 'dict', label: 'ლექსიკონი', href: '#/dict', icon: 'dict' },
  { id: 'grammar', label: 'გრამატიკა', href: '#/grammar', icon: 'grammar' },
  { id: 'practice', label: 'პრაქტიკა', href: '#/practice', icon: 'practice' },
  { id: 'phonetics', label: 'ბგერები', href: '#/phonetics', icon: 'phonetics' },
];

let wrap = null;

export function mountTabbar(root) {
  wrap = h(
    'div',
    { class: 'tabs' },
    h('span', { class: 'tab-pill', 'aria-hidden': 'true' }),
    TABS.map((t) =>
      h('a', { class: 'tab', href: t.href, dataset: { tab: t.id } }, h('span', { class: 'ico-wrap' }, icon(t.icon, 22)), h('span', null, t.label))
    )
  );
  // .ico-wrap არ გვჭირდება — სტილი პირდაპირ .ico-ზეა
  wrap.querySelectorAll('.ico-wrap').forEach((w) => w.replaceWith(...w.childNodes));
  root.replaceChildren(wrap);
}

export function setActiveTab(path) {
  if (!wrap) return;
  let id = path.split('/').filter(Boolean)[0] || 'days';
  if (id === 'day') id = 'days';
  const index = Math.max(0, TABS.findIndex((t) => t.id === id));
  wrap.style.setProperty('--i', String(index));
  wrap.querySelectorAll('.tab').forEach((a) => {
    const on = a.dataset.tab === id;
    if (on && !a.classList.contains('active')) {
      // ხატულის ანიმაცია თავიდან დავიწყოთ
      a.classList.remove('active');
      void a.offsetWidth;
    }
    a.classList.toggle('active', on);
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
}
