/**
 * Created by fed on 2017/8/24.
 */
import assign from 'object-assign';
import {
  fork, call, take, all,
} from 'redux-saga/effects';
import { routerReducer } from 'react-router-redux';

const UPDATE_SAGA = '@@INNER/UPDATE_SAGA';


export default assign({
  routing: routerReducer,
}, __ROOT_REDUCER__);

const runningSaga = [];

// @TODO changelog
function* waitingAwakeSaga(saga) {
  let setCtx = null;
  while (!saga) {
    const action = yield take(UPDATE_SAGA);
    if (runningSaga.indexOf(action.saga) === -1) {
      runningSaga.push(action.saga);
      saga = action.saga;
      setCtx = action.ctx;
      break;
    }
  }
  for (let i = 0; i < 100; i += 1) {
    try {
      yield setCtx;
      yield call(saga);
    } catch (e) {
      console.error(e, 'this is err');
    }
  }
}

export function* rootSaga() {
  const sagas = __ROOT_SAGA__.map(saga => fork(waitingAwakeSaga, saga));
  yield all(sagas);
}
