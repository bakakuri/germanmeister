const PATHS = {
  speaker: '<path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  back: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
  days: '<rect x="4" y="5.5" width="16" height="14" rx="4"/><path d="M8.5 3.5v4M15.5 3.5v4M4 10h16"/>',
  dict: '<path d="M6 4.5h10.5A1.5 1.5 0 0 1 18 6v12.5H7.5A1.5 1.5 0 0 1 6 17V4.5z"/><path d="M6 17a1.5 1.5 0 0 1 1.5-1.5H18"/>',
  grammar: '<path d="M12 4l8 4-8 4-8-4 8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 16l8 4 8-4"/>',
  practice: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
  phonetics: '<path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  tune: '<path d="M4 7h8M18 7h2M4 17h2M12 17h8"/><circle cx="15" cy="7" r="2.6"/><circle cx="9" cy="17" r="2.6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  slow: '<path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4H4z"/><path d="M16 12h5"/>',
};

export function icon(name, size = 22) {
  const wrap = document.createElement('span');
  wrap.className = 'ico';
  wrap.innerHTML =
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" ` +
    `stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;
  return wrap;
}
