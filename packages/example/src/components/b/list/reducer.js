/**
 * Created by fed on 2017/8/24.
 */
const defaultState = {
  name: 'bbc/list',
  value: 'kkk',
  loading: true,
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
    yield put((state) => {
      state.loading = true;
    });
    yield sleep(2 * 1000);
    yield put((state) => {
      state.loading = false;
    });
  },
};
