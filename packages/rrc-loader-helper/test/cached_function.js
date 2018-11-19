import test from 'ava';

import getCachedFunction from '../src/util/cached_function';

test('#getCachedFunction', t => {
  const page = 'page';
  const key = 'a.b.c';
  const mapping = {
    name: 'username',
  };
  const allow = (val) => val > 1;
  const otherAllow = (val) => val < 1;
  const onChange = (e) => console.log('change:', e);
  const otherOnChange = (e) => console.log('other change:', e);

  const old = getCachedFunction(page, key, mapping);
  t.is(
    old,
    getCachedFunction(page, key, mapping),
    'no allow should always return same');

  t.is(
    getCachedFunction(page, key, mapping, allow),
    getCachedFunction(page, key, mapping, allow),
    'with allow should also cache');

  t.is(
    getCachedFunction(page, key, mapping, allow),
    getCachedFunction(page, key, mapping, otherAllow),
    'with different allow should also cache');

  t.is(
    getCachedFunction(page, key, mapping, allow, onChange),
    getCachedFunction(page, key, mapping, allow, otherOnChange),
    'with different onchange should also cache');

  t.is(
    getCachedFunction(page, key, mapping, allow, onChange),
    getCachedFunction(page, key, mapping, otherAllow, otherOnChange),
    'with different allow and onchange should also cache');

  t.not(
    getCachedFunction(page, key, mapping, allow, onChange),
    getCachedFunction(page + '1', key, mapping, otherAllow, otherOnChange),
    'with different page and same allow/onchange should not cache');
});
