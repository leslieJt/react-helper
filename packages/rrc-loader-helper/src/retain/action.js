import {
  url as urlKey, page,
} from './const';

export function enhanceAction(action, obj) {
  return Object.assign(action, {
    [urlKey]: obj.url,
    [page]: obj.page,
  });
}

export function checkAction(action, assert, url) {
  if (!Object.prototype.hasOwnProperty.call(action, urlKey)) {
    return action.type === assert;
  }
  return action[urlKey] === url && action.type === assert;
}
