import genSaga from './util/gen-sage';
import transformReducer from './util/transform-reducer';

import { getStore } from './inj-dispatch';
import { updateSaga } from './actions';

export default function adaptToMobx(obj, page) {
  const ctx = transformReducer(obj, page);
  // @TODO ctx is very magic!!! use inSaga to switch dispatch function
  const saga = genSaga(obj, page, Object.create(ctx, {
    inSaga: {
      value: true,
      configurable: false,
      writable: false,
    },
  }));
  // @TODO can i use store?
  if (saga) {
    getStore((store) => {
      store.dispatch({
        type: updateSaga,
        saga,
      });
    });
  }
  return ctx;
}
