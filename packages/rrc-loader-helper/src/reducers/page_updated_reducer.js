import { updatePage } from '../actions';
import invariant from '../util/invariant';
import {
  setASymlink,
} from '../util';

export default function pageUpdatedReducer(state, action) {
  // page changed.
  if (action.type === updatePage) {
    // @TODO pipe reducers
    if (!action.payload.retain) return state;

    if (!invariant(action.payload.match, 'action\'s payload must has router params!')) return state;
    setASymlink(state, action.payload.page, action.payload.match.url);
    return state;
  }

  return state;
}
