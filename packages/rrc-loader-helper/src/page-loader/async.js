import enhanceReducer from '../reducer-decorate';
import { decorateReducers } from '../reducers';

import { getStore } from '../inj-dispatch';

// @TODO is it ok?
function asyncPageCallback(module, page, reducers, isolateReducer) {
  const { view, reducer, saga } = module;
  const store = getStore();
  if (reducer && !reducers[page]) {
    const enhancedReducer = enhanceReducer(reducer, page);
    if (isolateReducer) {
      Object.defineProperty(enhancedReducer, '.retain', {
        writable: false,
        value: true,
        configurable: false,
      });
    }
    reducers[page] = enhancedReducer;
    store.replaceReducer(decorateReducers(reducers));
  }
  return [view, saga || reducer.saga];
}

export default asyncPageCallback;
