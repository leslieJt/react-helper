import produce from 'immer';
import { updatePage } from '../actions';
import invariant from '../util/invariant';

const r = '.retained';
let prevMatch = null;

const isEmptyObj = obj => Object.keys(obj).length === 0;
const isNeedRetain = m => !isEmptyObj(m.params);
const genKey = url => url.substring(1);
const hasOwn = Object.prototype.hasOwnProperty;

const matchRetained = ({ url }, state) => {
  const retains = state[r];
  if (!retains) return undefined;

  const key = genKey(url);

  return hasOwn.call(retains, key) && retains[key];
};

const backupPrevState = (state) => {
  const { match: { params, path, url }, page } = prevMatch;

  if (!isNeedRetain(prevMatch.match)) return state;

  // siteGuideModel/edit/2066
  const key = genKey(url);

  return produce(state, (draft) => {
    const retainedData = { data: draft[page], meta: { path, params } };

    draft[r] = Object.assign(draft[r] || {}, { [key]: retainedData });
  });
};

const restoreNextState = (state, action) => {
  const retainedData = matchRetained(action.payload.match, state);

  return produce(state, (draft) => {
    if (retainedData) {
      draft[action.payload.page] = retainedData.data;
    } else if (isNeedRetain(action.payload.match)) draft[action.payload.page] = undefined;
  });
};

const retainStateReducer = (state, action) => {
  if (!action.payload.retain) return state;
  if (!invariant(action.payload.match, 'action\'s payload must has router params!')) return state;

  // match object example:
  //   params: {id: "2066"}
  //   path: "/sizeGuideModel/edit/:id"
  //   url: "/sizeGuideModel/edit/2066"

  const match = { match: action.payload.match, page: action.payload.page };
  if (!prevMatch) {
    prevMatch = match;
    return state;
  }

  const nextState = restoreNextState(backupPrevState(state), action);
  prevMatch = match;

  return nextState;
};

export const pageUpdatedReducer = (state, action) => {
  // page changed.
  if (action.type === updatePage) {
    // @TODO pipe reducers
    return retainStateReducer(state, action);
  }

  return state;
};
