import React from 'react';
import {
  getMappingVal,
  getCachedFunction,
} from './util';
import {
  get as getCurrentPage,
} from './current-page';
import { getStore } from './inj-dispatch';

const raw = React.createElement.bind(React);

// builtin props
const builtins = ['data-bind', 'data-mapping', 'data-disallow'];

// when pass into data-bind and onChange / disallow, performance may deteriorate
React.createElement = function createElement(type, config, ...children) {
  if (config) {
    const val = config[builtins[0]];
    const mapping = config[builtins[1]];
    const disallow = config[builtins[2]];

    if (val) {
      const store = getStore();
      if (store) {
        const page = getCurrentPage();
        const currentState = store.getState()[page];
        if (currentState) {
          config.value = getMappingVal(currentState, val.split('.'), mapping);
          config.onChange = getCachedFunction(page, val, mapping, disallow, config.onChange);
        }
      }

      // clear builtin props
      builtins.forEach(prop => delete config[prop]);
    }
  }

  return raw(type, config, ...children);
};
