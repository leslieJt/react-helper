import action from '../actions';
import {
  getStore
} from '../inj-dispatch';
import {
  reverseMappingVal
} from './mapping';
import {
  setCallback
} from '../current-page';

const onChangeCache = new Map();
const connector = '*&*^*&';

setCallback(function () {
  onChangeCache.clear();
});

const ok = () => false;
const noop = () => {};

function onchange(caller, e, page, val, mapping) {
  const store = getStore();
  let value = e;
  if (e && e.target) {
    value = e.target.value;
  }
  if (mapping) value = reverseMappingVal(value, mapping);

  if (!caller.fns.disallow(value)) {
    store.dispatch({
      type: action,
      page: page,
      key: val,
      value: value
    });
  }

  return caller.fns.originOnchange(e);
}

function generateCacheKey(page, val, mapping) {
  let key = [page, val].map(x => x.toString()).join(connector);
  if (mapping) {
    key += connector + JSON.stringify(mapping);
  }

  return key;
}

export default function getCachedOnchangeFunction(page, val, mapping, disallow = ok, originOnchange = noop) {
  let key = generateCacheKey(page, val, mapping);

  let cache = onChangeCache.get(key);
  if (cache) {
    // disallow or originOnchange may update, but cache reference won't change.
    cache.fns = { disallow, originOnchange };
  } else {
    cache = (e) => onchange(cache, e, page, val, mapping);
    cache.fns = { disallow, originOnchange };
    onChangeCache.set(key, cache);
  }

  return cache;
}
