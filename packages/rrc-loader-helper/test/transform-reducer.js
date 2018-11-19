import test from 'ava';
import transformReducer from '../src/util/transform-reducer';

test('#transform reducer', t => {
  const page = 'kkk';

  const raw = {
    defaultState: {
      a: 1
    },
    hello: (state, action) => {
      state.value = action.value;
    },
    * zz(action, ctx, put) {
      yield 1;
    },
  };
  const result = transformReducer(raw, page);
  const expected = {
    defaultState: result.defaultState,
    hello: result.hello,
    zz: result.zz,
    ['.__inner__']: {
      originalObject: raw,
      mapping: Object.assign(Object.create(raw), {
        [`${page}/defaultState`]: raw.defaultState,
        [`${page}/hello`]: raw.hello,
      }),
    }
  };

  t.deepEqual(result, expected);
});
