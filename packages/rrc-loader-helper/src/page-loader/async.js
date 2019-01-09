import {
  updateSaga
} from '../actions';
import enhanceReducer from '../reducer-decorate';
import { decorateReducers } from '../reducers';

import { getStore } from '../inj-dispatch';

// @TODO is it ok?
function asyncPageCallback(module, page, reducers) {
  const { view, reducer, saga } = module;
  const store = getStore();
  if (saga) {
    store.dispatch({ type: updateSaga, saga });
  }
  if (reducer && !reducers[page]) {
    reducers[page] = enhanceReducer(reducer, page);
    store.replaceReducer(decorateReducers(reducers));
  }
  return view;
}

export default asyncPageCallback;
