import React from 'react';
import {
  getMappingVal,
  getCachedFunction,
} from '../util';
import {
  CurrentPageContext,
} from '../current-page';
import { getStore } from '../inj-dispatch';

const createReactElement = React.createElement.bind(React);

export default function createElement(type, config, ...children) {
  const {
    'data-bind': dataBind,
    'data-mapping': dataMapping,
    'data-disallow': dataDisallow,
    ...otherConfig
  } = config || {};

  const store = getStore();
  if (store) {
    if (dataBind) {
      // clear builtin props
      return createReactElement(CurrentPageContext.Consumer, {}, ({ page, retain, url }) => {
        let currentState;
        if (retain) {
          currentState = store.getState()['.retain'][url];
        } else {
          currentState = store.getState()[page];
        }
        if (currentState) {
          otherConfig.value = getMappingVal(currentState, dataBind.split('.'), dataMapping);
          otherConfig.onChange = getCachedFunction(page,
            dataBind, dataMapping, dataDisallow, otherConfig.onChange, url);
        }
        return createReactElement(type, otherConfig, ...children);
      });
    }
  }
  return createReactElement(type, otherConfig, ...children);
}
