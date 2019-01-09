/**
 * Created by fed on 2017/8/24.
 */
import { simpleBind, any } from 'rrc-loader-helper/lib/sagas';

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
  return new Promise(resolve => setTimeout(resolve, n));
}


export default {
  defaultState,
  hello: (state, action) => {
    state.value = action.value;
  },
  * zz(action, ctx, put) {
    yield simpleBind(Promise.resolve(1), 'test.t1');
    yield any([Promise.resolve(2), Promise.all([sleep(1000), Promise.resolve(3)])], function* (pro, index) {
      const result = yield pro;
      yield put((draft) => { draft.test2[index] = result; });
    });
    yield put((state) => {
      state.loading = true;
    });
    yield sleep(2 * 1000);
    try {
      yield Promise.reject(-1);
    } catch (e) {
      console.log(e, 'eeeedasdsadas');
    }
    yield put((state) => {
      state.loading = false;
    });
  },
};
