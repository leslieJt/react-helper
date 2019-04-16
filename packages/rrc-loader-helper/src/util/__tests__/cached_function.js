import getCachedFunction from '../cached_function';

describe('#getCachedFunction', () => {
  const page = 'page';
  const key = 'a.b.c';
  const mapping = {
    name: 'username',
  };
  const allow = val => val > 1;
  const otherAllow = val => val < 1;
  const onChange = e => console.log('change:', e);
  const otherOnChange = e => console.log('other change:', e);

  const old = getCachedFunction(page, key, mapping);
  expect(old).toBe(getCachedFunction(page, key, mapping));

  test('#should return same result with same arguments given', () => {
    expect(getCachedFunction(page, key, mapping, allow)).toBe(
      getCachedFunction(page, key, mapping, allow)
    );

    expect(getCachedFunction(page, key, mapping, allow)).toBe(
      getCachedFunction(page, key, mapping, otherAllow)
    );

    expect(getCachedFunction(page, key, mapping, allow, onChange)).toBe(
      getCachedFunction(page, key, mapping, allow, otherOnChange)
    );

    expect(getCachedFunction(page, key, mapping, allow, onChange)).toBe(
      getCachedFunction(page, key, mapping, otherAllow, otherOnChange)
    );
  });

  test('#should return different result with different arguments given', () => {
    expect(getCachedFunction(page, key, mapping, allow, onChange)).not.toBe(
      getCachedFunction(page + '1', key, mapping, otherAllow, otherOnChange)
    );
  });
});
