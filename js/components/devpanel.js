import { CONFIG } from '../config.js';
import { h, toast } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { loadIndex, clearCache } from '../data/loader.js';
import { go } from '../router.js';
import * as state from '../state.js';

// დეველოპერის პანელი: ტესტირებისთვის. გამორთვა — CONFIG.DEV_PANEL = false.
export function mountDevPanel(root) {
  if (!CONFIG.DEV_PANEL) return;

  const close = () => (root.hidden = true);
  const refresh = () => window.dispatchEvent(new Event('app:refresh'));

  async function open() {
    const index = await loadIndex();
    const level = h('select', { class: 'inp', 'aria-label': 'დონე' }, index.levels.map((l) => h('option', { value: l.id, selected: l.id === state.get().level }, l.id)));
    const day = h('input', { class: 'inp', type: 'number', min: 1, value: 1, 'aria-label': 'დღე' });

    root.replaceChildren(
      h(
        'div',
        { class: 'dev-card' },
        h('header', null, h('h2', null, 'დეველოპერის პანელი'), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'დახურვა', onclick: close }, icon('close'))),
        h('p', { class: 'muted' }, `localStorage: ${CONFIG.USE_STORAGE ? 'ჩართულია' : 'გამორთულია'} (js/config.js)`),
        h('div', { class: 'dev-row' }, level, day, h('button', { class: 'btn btn-soft', type: 'button', onclick: () => (close(), go(`/day/${level.value}/${day.value}`)) }, 'გადასვლა')),
        h(
          'button',
          {
            class: 'btn btn-soft',
            type: 'button',
            onclick: () => {
              const lv = index.levels.find((l) => l.id === state.get().level);
              state.markLearned(lv.id, lv.ready);
              toast(`${lv.id}: ${lv.ready.length} მზა დღე მონიშნულია`);
              refresh();
            },
          },
          'მიმდინარე დონის მზა დღეები — ნასწავლად'
        ),
        h(
          'button',
          {
            class: 'btn btn-soft',
            type: 'button',
            onclick: () => {
              state.resetProgress();
              toast('პროგრესი განულდა');
              refresh();
            },
          },
          'პროგრესის განულება'
        ),
        h(
          'button',
          {
            class: 'btn btn-soft',
            type: 'button',
            onclick: () => {
              clearCache();
              toast('მონაცემების ქეში გასუფთავდა');
              refresh();
            },
          },
          'მონაცემების ხელახლა ჩატვირთვა'
        )
      )
    );
    root.hidden = false;
  }

  root.addEventListener('click', (e) => e.target === root && close());
  window.addEventListener('keydown', (e) => e.key === 'Escape' && close());
  window.addEventListener('app:dev', () => (root.hidden ? open() : close()));
}
