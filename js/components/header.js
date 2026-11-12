import { CONFIG } from '../config.js';
import { h } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { currentTheme, toggleTheme } from '../theme.js';
import { go } from '../router.js';

const PARENTS = { day: '/days', grammar: '/grammar', practice: '/practice' };

function logo() {
  return h(
    'a',
    { class: 'logo', href: '#/days', 'aria-label': 'Deutsch Weg — მთავარი' },
    h('span', { class: 'logo-dots', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
    h('span', { class: 'logo-text' }, 'Deutsch Weg')
  );
}

export function renderHeader(root, path, title) {
  const seg = path.split('/').filter(Boolean);
  const isSub = seg.length > 1 && PARENTS[seg[0]];

  const left = isSub
    ? h(
        'button',
        { class: 'icon-btn', type: 'button', 'aria-label': 'უკან', onclick: () => go(PARENTS[seg[0]]) },
        icon('back')
      )
    : logo();

  const themeBtn = h(
    'button',
    {
      class: 'icon-btn',
      type: 'button',
      'aria-label': 'თემის შეცვლა',
      onclick: () => {
        toggleTheme();
        renderHeader(root, path, title);
      },
    },
    icon(currentTheme() === 'dark' ? 'sun' : 'moon')
  );

  const devBtn = CONFIG.DEV_PANEL
    ? h(
        'button',
        {
          class: 'icon-btn',
          type: 'button',
          'aria-label': 'დეველოპერის პანელი',
          onclick: () => window.dispatchEvent(new CustomEvent('app:dev')),
        },
        icon('tune')
      )
    : null;

  root.replaceChildren(
    h(
      'div',
      { class: 'hdr' },
      h('div', { class: 'hdr-left' }, left, isSub ? h('h1', { class: 'hdr-title' }, title || '') : null),
      h('div', { class: 'hdr-right' }, themeBtn, devBtn)
    )
  );
}
