import { put } from 'redux-saga/effects';

import { getStore } from '../inj-dispatch';
import isGeneratorFunction from '../sagas/is-generator';
import { setValue } from '../actions';
import isPlainObject, { isPrimitive } from './isPlainObject';
import { setValKeyPathMute } from './obj_key_path_ops';

function addSetMethod(result, page) {
  result.set = function setValueByRRCLoaders(key, value, description) {
    let val;
    if (typeof key === 'string') {
      val = { [key]: value };
    } else if (isPlainObject(key)) {
      val = key;
      description = value;
    }

    Object.keys(val).forEach((k) => {
      if (!isPrimitive(val[k])) {
        throw new Error(
          `value must be a primitive value, but [${k}]: ${JSON.stringify(val[k])} given, you may need move your logic to reducer!`
        );
      }
    });

    getStore((store) => {
      store.dispatch({
        type: setValue,
        page,
        fn: function set(draft) {
          Object.keys(val).forEach(k => setValKeyPathMute(draft, k.split('.'), val[k]));
        },
        description: description || 'set value by builtin `set` method'
      });
    });
  };
}

export default function (obj, page) {
  if (!(typeof obj === 'object' && !Array.isArray(obj))) {
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
  if (!result.set) {
    // mutate result
    addSetMethod(result, page);
  }
  result['.__inner__'] = {
    originalObject,
    mapping,
  };
  return result;
}
