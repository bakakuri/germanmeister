// ლექსიკონის ფაილის ასო: ä→a, ö→o, ü→u, ß→s (იგივე წესია tools/lib.mjs-შიც)
const MAP = { ä: 'a', ö: 'o', ü: 'u', ß: 's' };

export function baseLetter(ch) {
  const c = String(ch || '').toLowerCase();
  return MAP[c] || c;
}

export const isLatin = (s) => /^[a-zäöüß]/i.test(s);
