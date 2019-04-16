import reduceReducers from 'reduce-reducers';
import combineReducers from './combine-reducers';
import invariant from '../util/invariant';
import {
  retainHocReducer,
} from '../retain';

const noop = () => {};
const registeredReducers = [];

export function decorateReducers(reducers) {
  return reduceReducers(
    ...registeredReducers,
    combineReducers(Object.assign(reducers, { '.retain': retainHocReducer }))
  );
}

// reducer can access global state.
export default function registerReducer(reducer) {
  const isValid = invariant(typeof reducer === 'function', 'handler must be a function!');

  if (!isValid) return noop;

  if (registeredReducers.find(r => r === reducer)) {
    console.warn('reducer has been registered!');
    return noop;
  }
  registeredReducers.push(reducer);

  // revoke
  return () => {
    const index = registeredReducers.findIndex(reducer);
    if (index === -1) return;
    registeredReducers.splice(index, 1);
  };
}
