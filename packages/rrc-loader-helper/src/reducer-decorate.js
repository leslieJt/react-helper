import produce from 'immer';
import { sendError } from 'sheinq';
import theAction, { editInSaga } from './actions';
import {
  setValKeyPath,
} from './util/obj_key_path_ops';

function builtinReducer(state, action, page) {
  if (action.page !== page) return null;
  switch (action.type) {
    case theAction:
      return setValKeyPath(state, action.key.split('.'), action.value);
    case editInSaga:
      return produce(state, (draft) => {
        try {
          return action.fn(draft, action);
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            throw e;
          }
          console.error('It"s called by rrc-loader-helper:' + e);
          sendError(e);
          return state;
        }
      });
    default:
      return null;
  }
}

export default function decorateFn(fn, page) {
  if (typeof fn !== 'function' && typeof fn === 'object') {
    if (Object.hasOwnProperty.call(fn, '.__inner__')) {
      fn = fn['.__inner__'].mapping;
    }

    if (!(fn.defaultState)) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('required property defaultState in reducer \n'
          + ' reducer 对象缺少 defaultState 属性\n'
          + `位置位于${page}所属的reducer`);
      } else {
        fn.defaultState = {};
      }
    }
    /**
     * reducer 为对象的时候包装为immer处理方式
     * 对象内 defaultState 为必须属性
     */
    return (state = fn.defaultState, action) => {
      const builtinState = builtinReducer(state, action, page);
      if (builtinState) return builtinState;
      if (Object.hasOwnProperty.call(fn, action.type) && typeof fn[action.type] === 'function') {
        return produce(state, (draft) => {
          try {
            return fn[action.type](draft, action);
          } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
              throw e;
            }
            console.error('It"s called by rrc-loader-helper:' + e);
            sendError(e);
            return state;
          }
        });
      }
      return state;
    };
  }
  return (state, action) => {
    const builtinState = builtinReducer(state, action, page);
    if (builtinState) return builtinState;
    try {
      return fn(state, action);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        throw e;
      }
      console.error('It"s called by rrc-loader-helper:' + e);
      sendError(e);
      return state;
    }
  };
}
