// for global unique
import './util/gen-sage';

let store;

const pendings = [];

export default function injectStore(s) {
  store = s;
  while (pendings.length) {
    pendings.shift()(store);
  }
}

export function getStore(cb = () => {}) {
  if (!store) {
    pendings.push(cb);
    return false;
  }
  cb(store);
  return store;
}
