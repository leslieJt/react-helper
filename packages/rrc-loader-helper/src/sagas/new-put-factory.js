import { put } from '@vve/redux-saga/effects';
import { editInSaga } from '../actions';

export default function newPutFactory(page, callerName) {
  return function newPut(action, description = '') {
    if (!action.type && typeof action === 'function') {
      return put({
        type: editInSaga,
        page,
        fromMethod: callerName,
        fn: action,
        description,
      });
    }
    return put(action);
  };
}
