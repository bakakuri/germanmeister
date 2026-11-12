// ღილაკზე დაჭერისას ტალღა ვრცელდება დაჭერის წერტილიდან.
const SELECTOR = '.btn, .opt, .chip, .art-btn, .letter, .step, .game, .rng';

export function initRipple() {
  document.addEventListener(
    'pointerdown',
    (e) => {
      const target = e.target.closest?.(SELECTOR);
      if (!target || target.disabled) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const dot = document.createElement('span');
      dot.className = 'rip';
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - rect.left - size / 2}px`;
      dot.style.top = `${e.clientY - rect.top - size / 2}px`;
      target.append(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    },
    { passive: true }
  );
}
