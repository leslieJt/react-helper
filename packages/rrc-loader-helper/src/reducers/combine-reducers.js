import {
  stick$refToState,
} from '../util';

export default function combineReducers({ '.retain': retainHocReducer, ...others }) {
  const finalReducers = {
    '.retain': retainHocReducer(others),
    ...others,
  };
  const finalReducerKeys = Object.keys(finalReducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < finalReducerKeys.length; i += 1) {
      const key = finalReducerKeys[i];
      const previousStateForKey = state[key];
      const reducer = finalReducers[key];
      // @TODO warning
      if (typeof reducer === 'function') {
        if (!Object.hasOwnProperty.call(reducer, '.retain')) {
          const nextStateForKey = reducer(previousStateForKey, action);
          nextState[key] = nextStateForKey;
          hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        } else {
          const descr = Object.getOwnPropertyDescriptor(state, key);
          if (descr) {
            Object.defineProperty(nextState, key, descr);
          }
        }
      }
    }

    if (hasChanged) {
      stick$refToState(state, nextState);
      return nextState;
    }
    return state;
  };
}
