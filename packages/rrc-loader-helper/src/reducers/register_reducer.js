import invariant from '../util/invariant';

const noop = () => {};
export const registeredReducers = [];

// reducer can access global state.
export function registerReducer(reducer) {
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
  }
}
