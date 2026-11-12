import { h } from '../utils/dom.js';
import { icon } from '../utils/icons.js';

// ჰორიზონტალური კარუსელი: გადაფურცლვა თითით, ისრებით ან წერტილებით.
// სლაიდები ცენტრში ჩერდება, მეზობლების კიდეები ჩანს.
export function carousel(items, { label = 'ბარათები' } = {}) {
  if (!items.length) return null;

  const track = h(
    'div',
    { class: 'car-track', tabindex: '0', role: 'group', 'aria-label': label },
    items.map((el, i) => h('div', { class: 'car-slide', 'aria-label': `${i + 1} / ${items.length}` }, el))
  );
  const slides = [...track.children];

  let current = 0;
  const goTo = (i) => {
    const s = slides[Math.max(0, Math.min(slides.length - 1, i))];
    track.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2, behavior: 'smooth' });
  };

  const prev = h('button', { class: 'icon-btn car-btn', type: 'button', 'aria-label': 'წინა ბარათი', onclick: () => goTo(current - 1) }, icon('back'));
  const next = h('button', { class: 'icon-btn car-btn car-next', type: 'button', 'aria-label': 'შემდეგი ბარათი', onclick: () => goTo(current + 1) }, icon('back'));

  const useDots = slides.length <= 12;
  const dots = useDots
    ? slides.map((_, i) => h('button', { class: 'car-dot', type: 'button', 'aria-label': `ბარათი ${i + 1}`, onclick: () => goTo(i) }))
    : [];
  const counter = h('span', { class: 'car-count' }, `1 / ${slides.length}`);

  function paint() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    });
    current = best;
    counter.textContent = `${best + 1} / ${slides.length}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === best));
    slides.forEach((s, i) => s.classList.toggle('is-active', i === best));
    prev.disabled = best === 0;
    next.disabled = best === slides.length - 1;
  }

  // საწყისი მდგომარეობა
  dots[0]?.classList.add('active');
  slides[0].classList.add('is-active');
  prev.disabled = true;
  next.disabled = slides.length < 2;

  let frame = 0;
  track.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    },
    { passive: true }
  );

  return h(
    'div',
    { class: 'car' },
    track,
    h('div', { class: 'car-bar' }, prev, useDots ? h('div', { class: 'car-dots' }, dots) : counter, next)
  );
}
