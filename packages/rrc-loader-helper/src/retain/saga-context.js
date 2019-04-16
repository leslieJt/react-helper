import {
  getContext,
  setContext,
} from '@vve/redux-saga/effects';
import {
  url as urlKey, page as pageKey,
} from './const';

export function setCtx({ url, page, ...others }) {
  return setContext({
    [urlKey]: url,
    [pageKey]: page,
    ...others,
  });
}

export function getCtx() {
  return getContext(urlKey);
}
