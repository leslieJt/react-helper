import transformReducer from '../transform-reducer';

test('#transform reducer', () => {
  const page = 'kkk';

  const raw = {
    defaultState: {
      a: 1
    },
    hello: (state, action) => {
      state.value = action.value;
    },
    * zz() {
      yield 1;
    },
  };
  const result = transformReducer(raw, page);
  const expected = {
    hello: result.hello,
    zz: result.zz,
    set: result.set,
    '.__inner__': {
      originalObject: raw,
      mapping: Object.assign(Object.create(raw), {
        [`${page}/hello`]: raw.hello,
      }),
      setCurrentPage: result['.__inner__'].setCurrentPage,
    }
  };
  expect(result).toEqual(expected);
  expect(
    Object.prototype.isPrototypeOf.call(
      result,
      result['.__inner__'].setCurrentPage()
    )
  ).toBeTruthy();
});
