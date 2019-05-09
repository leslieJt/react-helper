/**
 * 为store添加set方法，类似datum
 */
import { setValKeyPathMute } from './obj_key_path_ops';

function isSimpleData(v) {
  const type = typeof v;
  return (
    v == null
      || type === 'string'
      || type === 'number'
      || type === 'boolean'
      || type === 'symbol'
      || (Array.isArray(v) && v.length === 0)
      || (type === 'object' && Object.keys(v).length === 0)
  );
}

function* setValueByRRCLoaders(action) {
  if (process.env.NODE_ENV !== 'production') {
    Object.keys(action).forEach((k) => {
      if (!isSimpleData(action[k])) {
        throw new Error(
          `value must a primitive value, but [${k}]: ${JSON.stringify(
            action[k]
          )} given, you may need to move your logic to reducer!`
        );
      }
    });
  }

  yield (state) => {
    Object.keys(action).forEach((k) => {
      setValKeyPathMute(state, k.split('.'), action[k]);
    });
  };
}

// mutate reducer object
export default function addSet(obj) {
  if (obj.set && obj.set !== setValueByRRCLoaders) {
    console.warn('your `set` method in store will conflict with builtin\'s，consider rename it first!');
    return obj;
  }

  obj.set = setValueByRRCLoaders;

  return obj;
}
