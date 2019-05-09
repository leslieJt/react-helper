import genSaga from './sagas/gen-sage';
import transformReducer from './util/transform-reducer';

const set = {
  value: function notSupported() {
    throw new Error('`set` not supported in store\'s methods, please use it outside!');
  },
  configurable: false,
  writable: false,
};

const inSaga = {
  value: true,
  configurable: false,
  writable: false,
};

const asyncMode = {
  value: true,
  configurable: false,
  writable: false,
};

export default function adaptToMobx(obj, page) {
  const ctx = transformReducer(obj, page);
  // @TODO ctx is very magic!!! use inSaga to switch dispatch function

  // @TODO async mode ctx !!!!
  const saga = genSaga(obj, page, Object.create(ctx, {
    set,
    inSaga,
  }), Object.create(ctx, {
    set,
    inSaga,
    asyncMode
  }));
  ctx.saga = saga;
  return ctx;
}
