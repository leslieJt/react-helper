import isGenerator from '../is-generator';

test('#is generator test', () => {
  function* g() {
    yield 1;
  }

  function ng() {
    return 1;
  }

  expect(isGenerator(g)).toBe(true);
  expect(isGenerator(ng)).not.toBe(true);
});
