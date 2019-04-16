import {
  select,
  put, putMutation, selectSelf, putAsyncAction,
} from './io';

const editInSaga = '@@INNER/SAGA_EDIT';

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

export default function completeIOType(io) {
  if (typeof io === 'function') {
    return putMutation(io);
  }
  if (io === '') {
    return selectSelf();
  }
  if (typeof io === 'string') {
    return select(state => state[io]);
  }
  if (Array.isArray(io) && io.every(x => typeof x === 'string')) {
    return select(state => [io].map(x => state[x]));
  }
  return io;
}
