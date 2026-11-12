// მარტივი hash-როუტერი: #/day/A1/3
const routes = [];
let onChange = () => {};

export function route(pattern, handler) {
  const keys = [];
  const source = pattern.replace(/:([a-zA-Z]+)/g, (_, k) => {
    keys.push(k);
    return '([^/]+)';
  });
  routes.push({ re: new RegExp(`^${source}/?$`), keys, handler });
}

export function onRoute(fn) {
  onChange = fn;
}

export function currentPath() {
  return decodeURIComponent(location.hash.slice(1)) || '/days';
}

export function go(path) {
  if (location.hash === '#' + path) resolve();
  else location.hash = '#' + path;
}

export function resolve() {
  const path = currentPath();
  for (const r of routes) {
    const m = path.match(r.re);
    if (!m) continue;
    const params = {};
    r.keys.forEach((k, i) => (params[k] = m[i + 1]));
    onChange(path, params, r.handler);
    return;
  }
  go('/days');
}

export function start() {
  window.addEventListener('hashchange', resolve);
  window.addEventListener('app:refresh', resolve);
  resolve();
}
