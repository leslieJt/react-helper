import produce from 'immer';
import { cleanPage } from '../actions';
import invariant from '../util/invariant';
import registerReducer from './register_reducer';

export function cleanStore(draft, page, url) {
  if (draft['.retain'][url]) draft['.retain'][url] = undefined;
  if (draft[page]) draft[page] = undefined;
}

export function cleanPageReducer(state = {}, {
  type, payload
}) {
  if (type === cleanPage) {
    if (!invariant(typeof payload.url === 'string' && payload.url,
      'action.payload.url must be valid string!')) return state;

    return produce(state, (draft) => {
      const { page, url } = payload;

      cleanStore(draft, page, url);
    });
  }
  return state;
}

export const registerCleanPageReducer = () => registerReducer(cleanPageReducer);
