import {
  url as urlKey, page as pageKey,
} from './const';
import {
  updatePage,
} from '../actions';

function getUrlAndPage(action) {
  return {
    url: action[urlKey],
    page: action[pageKey],
  };
}

export default function retainHocReducer(reducers) {
  const shouldRetainReducerKeys = Object.keys(reducers)
    .filter(key => Object.prototype.hasOwnProperty.call(reducers[key], '.retain'));
  const shallRetainReducers = {};
  for (let i = 0; i < shouldRetainReducerKeys.length; i += 1) {
    const key = shouldRetainReducerKeys[i];
    shallRetainReducers[key] = reducers[key];
  }

  return (state = {}, action) => {
    let url;
    let page;
    if (action.type === updatePage && action.payload.retain) {
      const obj = action.payload;
      url = obj.match.url;
      page = obj.page;
    } else {
      const obj = getUrlAndPage(action);
      url = obj.url;
      page = obj.page;
    }

    if (url && page && Object.prototype.hasOwnProperty.call(shallRetainReducers, page)) {
      const currentStateForUrl = state[url];
      const fn = shallRetainReducers[page];
      return Object.assign({}, state, {
        [url]: fn(currentStateForUrl, action),
      });
    }

    return state;
  };
}
