/**
 * cpopy https://github.com/tj/co/blob/717b043371ba057cb7a4a2a4e47120d598116ed7/index.js#L210
 */
import {
  takeLatest, fork, call
} from '@vve/redux-saga/effects';

import isGeneratorFunction from './is-generator';

import newPutFactory from './new-put-factory';
import {
  addLifecycle,
} from './generator-lifecycle';
import IOType, {
  anyOne,
  simpleBindResult,
} from './ios';
import {
  setValKeyPathMute,
} from '../util/obj_key_path_ops';

const cacheMap = new Map();

const noop = () => {};

const markingStatusCbFactory = newPutFn => ({
  onAddStatus(added) {
    return newPutFn((state) => {
      added.forEach((mark) => {
        state[mark] = 0;
      });
    }, 'change some flags to loading');
  },
  onOk(markings) {
    const result = newPutFn((state) => {
      markings.forEach((mark) => {
        state[mark] = 1;
      });
    }, 'change some flags to done');
    return result;
  },
  onError(markings) {
    const result = newPutFn((state) => {
      markings.forEach((mark) => {
        state[mark] = 2;
      });
    }, 'change some flags to error');
    return result;
  },
  onYield(value) {
    if (Object.hasOwnProperty.call(value, IOType) && value[IOType]) {
      if (value.type === simpleBindResult) {
        const [promise, path] = value.args;
        return call(function* anyOneIOWrapper() {
          const promiseResult = yield promise;
          yield newPutFn(state => setValKeyPathMute(state, path.split('.'), promiseResult));
        });
      } if (value.type === anyOne) {
        let [promiseArray, anyoneCallback] = value.args;
        if (!Array.isArray(promiseArray)) {
          promiseArray = [promiseArray];
        }
        anyoneCallback = anyoneCallback || noop;
        return call(function* anyOneIOWrapper() {
          for (let j = 0; j < promiseArray.length; j += 1) {
            yield fork(anyoneCallback, promiseArray[j], j);
          }
          yield Promise.all(promiseArray);
        });
      }
    }
    return value;
  }
});

export default function genSagas(obj, page, ctx, asyncCtx) {
  if (!cacheMap.get(page)) {
    const keys = Object.keys(obj);
    const generatorKeys = keys.filter(key => isGeneratorFunction(obj[key]));
    if (generatorKeys.length === 0) return null;
    cacheMap.set(page, function* generatedSaga() {
      for (let i = 0; i < generatorKeys.length; i += 1) {
        const key = generatorKeys[i];
        const fn = obj[key];
        const newPutFn = newPutFactory(page, fn.name);
        const decorateSaga = markingStatusCbFactory(newPutFn);
        yield takeLatest(`${page}/${key}`,
          addLifecycle(action => fn.call(asyncCtx, action, ctx, newPutFn), decorateSaga));
      }
    });
  }
  return cacheMap.get(page);
}
