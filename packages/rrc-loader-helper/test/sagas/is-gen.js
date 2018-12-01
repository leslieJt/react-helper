import test from 'ava';

import isGenerator from '../../src/sagas/is-generator';

test('#is generator test', t => {
  function* g() {
    yield 1;
  }

  function ng() {
    return 1;
  }

  t.is(isGenerator(g), true, 'A generator function should pass the gen test');
  t.not(isGenerator(ng), true, 'A trivial function should not return true');

});