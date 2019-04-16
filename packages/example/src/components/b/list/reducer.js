/**
 * Created by fed on 2017/8/24.
 */
import { any, markStatus } from 'rrc-loader-helper/lib/sagas';

const defaultState = {
  name: 'bbc/list',
  value: 'kkk',
  loading: true,
  test: {
    t1: 0,
  },
  test2: [],
  outBound: {},
};

function sleep(n) {
  return new Promise(resolve => setTimeout(() => resolve(n), n));
}


export default {
  defaultState,
  $zz(payload) {
    payload.loading = true;
  },
  ko() {
    console.log(123);
  },
  * abc() {
    yield sleep(1000);
    console.log('worker abc!');
  },
  * zz(action, ctx) {
    markStatus('kkk');
    const res = yield '';
    console.log(res);

    yield any([Promise.resolve(2), Promise.all([sleep(1000), Promise.resolve(3)])], function* (pro, index) {
      const result = yield pro;
      yield (draft) => { draft.test2[index] = result; };
    });
    const t = Date.now();
    yield this.abc();
    yield ctx.abc();
    console.log('consume: ', Date.now() - t, 'ms')
    try {
      yield Promise.reject(-1);
    } catch (e) {
      console.log(e, 'eeeedasdsadas');
    }
    yield (state) => {
      state.loading = false;
    };
  },
};
