// export some effects for convenience

import ioType, { simpleBindResult, anyOne } from './ios';
import markStatus from './generator-lifecycle';

function genIOAction(type) {
  return (...args) => ({
    [ioType]: true,
    type,
    args,
  });
}

export const simpleBind = genIOAction(simpleBindResult);
export const any = genIOAction(anyOne);
export {
  markStatus,
};
