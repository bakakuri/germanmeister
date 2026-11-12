import { CONFIG } from './config.js';

// localStorage-ის ერთადერთი შესასვლელი. USE_STORAGE=false-ზე არაფერს ინახავს.
export function load() {
  if (!CONFIG.USE_STORAGE) return null;
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY));
  } catch {
    return null;
  }
}

export function save(data) {
  if (!CONFIG.USE_STORAGE) return;
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* სივრცე გაივსო ან შენახვა დაბლოკილია */
  }
}

export function clear() {
  try {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  } catch {
    /* არაფერი */
  }
}
