import reduceReducers from 'reduce-reducers';
import { combineReducers } from 'redux';
import {
  updateSaga
} from '../actions';
import enhanceReducer from '../reducer-decorate';
import { registeredReducers } from '../reducers';

import { getStore } from '../inj-dispatch';

// @TODO is is ok?
function asyncPageCallback(module, page, reducers) {
  const { view, reducer, saga } = module;
  const store = getStore();
  if (saga) {
    store.dispatch({ type: updateSaga, saga });
  }
  if (reducer && !reducers[page]) {
    reducers[page] = enhanceReducer(reducer, page);
    store.replaceReducer(reduceReducers(...registeredReducers, combineReducers(reducers)));
  }
  return view;
}

export default asyncPageCallback;
