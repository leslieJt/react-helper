// @TODO move this module

import { put, putAsyncAction } from '@vve/redux-saga/effects';

import {
  enhanceAction,
} from '../retain';
import { getStore } from '../inj-dispatch';

const maskKeys = ['defaultState', '$out'];

function isGenerator(obj) {
  return typeof obj.next === 'function' && typeof obj.throw === 'function';
}

function isGeneratorFunction(obj) {
  const { constructor } = obj;
  if (!constructor) return false;
  if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction') return true;
  return isGenerator(constructor.prototype);
}

export default function (obj, page) {
  if (!(typeof obj === 'object' && !Array.isArray(obj))) {
    throw new Error('Your reducer must be an object, if you wanna use MobX style!');
  }
  const originalObject = obj;
  const keys = Object.keys(originalObject).filter(x => maskKeys.indexOf(x) === -1);
  const result = {};
  const mapping = Object.create(originalObject);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    result[key] = function dispatchProvidedByRRCLoaders(arg) {
      let dispatch;
      // @TODO magic, problem!!!
      if (!this.inSaga) {
        const store = getStore();
        if (!store) {
          throw new Error('currently no store got, it\'s a bug caused by rrc-loader-helper.');
        }
        dispatch = (action) => {
          store.dispatch(action);
          const donePromise = action['@@INNER/DONE_MARK'];
          if (donePromise) {
            return donePromise;
          }
          return {
            then() {
              throw new Error(`The action: '${key}' is a pure sync function, and you cannot trait it as a promise`);
            }
          };
        };
      } else if (this.asyncMode && isGeneratorFunction(originalObject[key])) {
        dispatch = putAsyncAction;
      } else {
        dispatch = put;
      }

      if (arg && typeof arg === 'function') {
        throw new Error('In the mobx style, you must pass arguments to method in object form.');
      }
      if (typeof arg !== 'object') {
        arg = {
          payload: arg,
        };
      }

      const action = Object.assign({}, arg, {
        type: `${page}/${key}`,
      });
      if (dispatch === putAsyncAction
        || (!this.inSaga && isGeneratorFunction(originalObject[key]))
      ) {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        promise.resolve = resolve;
        promise.reject = reject;

        Object.defineProperty(action, '@@INNER/DONE_MARK', {
          value: promise,
          enumerable: false,
          writable: false,
        });
        promise.action = action;
      }

      if (this.$$currentPageCtx) {
        enhanceAction(action, this.$$currentPageCtx);
      }

      return dispatch(action);
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
    // 原型继承
    setCurrentPage(p) {
      return Object.create(result, {
        $$currentPageCtx: {
          value: p,
          writable: false,
          configurable: false,
        },
      });
    },
  };
  return result;
}
