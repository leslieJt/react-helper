import { put } from 'redux-saga/effects';

import { getStore } from '../inj-dispatch';

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

function isGeneratorFunction(obj) {
  const constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

export default function (obj, page) {
  if(!(typeof obj === 'object' && !Array.isArray(obj))){
   throw new Error('Your reducer must be an object, if you wanna use MobX style!');
  }
  const originalObject = obj;
  const keys = Object.keys(originalObject);
  const result = {};
  const mapping = Object.create(originalObject);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    result[key] = function dispatchProvidedByRRCLoaders(arg) {
      let dispatch;
      // @TODO magic
      if (!this.inSaga) {
        const store = getStore();
        if (!store) {
          throw new Error('currently no store got, it\'s a bug caused by rrc-loader-helper.');
        }
        dispatch = store.dispatch;
      } else {
        dispatch = put;
      }

      if (arg && typeof arg !== 'object') {
        throw new Error('In the mobx style, you must pass arguments to method in object form.');
      }
      return dispatch(Object.assign({}, arg, {
        type: `${page}/${key}`,
      }));
    };
    result[key].type = `${page}/${key}`;
    if (!isGeneratorFunction(originalObject[key])) {
      mapping[`${page}/${key}`] = originalObject[key];
      mapping[`${page}/${key.replace(/^\$/, '')}`] = originalObject[key];
    }
  }
  result['.__inner__'] = {
    originalObject,
    mapping,
  };
  return result;
};
