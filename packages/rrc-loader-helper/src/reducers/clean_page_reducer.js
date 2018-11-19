import produce from 'immer';
import { cleanPage } from '../actions';
import invariant from '../util/invariant';
import { registerReducer } from './register_reducer';

export function cleanStore(draft, page, url) {
  if (draft['.retained'][url]) draft['.retained'][url] = undefined;
  if (draft[page]) draft[page] = undefined;
}

export function cleanPageReducer(state = {}, action) {
  if (action.type === cleanPage) {
    if (!invariant(typeof action.payload.url === 'string' && action.payload.url,
      'action.payload.url must be valid string!')) return state;

    return produce(state, (draft) => {
      const { page, url } = action.payload;

      cleanStore(draft, page, url);
    });
  }
  return state;
}

export const registerCleanPageReducer = () => registerReducer(cleanPageReducer);
