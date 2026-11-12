// პატარა helper-ები DOM-ის ასაწყობად.
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  append(el, children);
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// SVG ელემენტები (h() მხოლოდ HTML-ს ქმნის)
export function s(tag, attrs, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null) continue;
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v);
  }
  append(el, children);
  return el;
}

// ანაცვლებს შვილებს: მასივებს ასწორებს, null-ს გამოტოვებს (replaceChildren null-ს ტექსტად აქცევდა)
export function fill(el, ...children) {
  el.replaceChildren();
  return append(el, children);
}

export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

// **გამუქებული** ტექსტი უსაფრთხოდ, innerHTML-ის გარეშე.
export function rich(text) {
  const frag = document.createDocumentFragment();
  String(text)
    .split(/(\*\*[^*]+\*\*)/)
    .forEach((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        frag.append(h('strong', null, part.slice(2, -2)));
      } else if (part) {
        frag.append(document.createTextNode(part));
      }
    });
  return frag;
}

export function artTag(article) {
  return article ? h('span', { class: `art art-${article}` }, article) : null;
}

export function shuffle(list) {
  const r = [...list];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

let toastTimer;
export function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// რიცხვი რბილად იზრდება 0-დან მნიშვნელობამდე
export function countUp(el, to, { duration = 900, suffix = '' } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || to === 0) {
    el.textContent = `${to}${suffix}`;
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${Math.round(to * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
