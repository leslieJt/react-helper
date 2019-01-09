const pages = new Map();

export function registerPage(key, val) {
  pages.set(key, val);
}

export function getPage(key) {
  return pages.get(key);
}
