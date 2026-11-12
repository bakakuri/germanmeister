// კონფეტი წერტილიდან (x, y) — Web Animations API, ბიბლიოთეკის გარეშე.
const COLORS = ['#7fb3e6', '#f08aab', '#80d4b2', '#f5c76b', '#a58bf0', '#f4a77a'];

export function burst(x = innerWidth / 2, y = innerHeight / 2, count = 26) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  document.body.append(layer);

  const animations = [];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i');
    const size = 6 + Math.random() * 6;
    piece.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size * (Math.random() > 0.5 ? 1 : 0.5)}px;background:${COLORS[i % COLORS.length]}`;
    layer.append(piece);

    const angle = Math.random() * Math.PI * 2;
    const power = 90 + Math.random() * 170;
    const dx = Math.cos(angle) * power;
    const dy = Math.sin(angle) * power - 90;
    animations.push(
      piece.animate(
        [
          { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 540}deg) scale(1)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${dx * 1.15}px,${dy + 220}px) rotate(${Math.random() * 900}deg) scale(0.6)`, opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }
      )
    );
  }
  Promise.all(animations.map((a) => a.finished.catch(() => {}))).then(() => layer.remove());
}

// ელემენტის ცენტრიდან
export function burstAt(el, count) {
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, count);
}
