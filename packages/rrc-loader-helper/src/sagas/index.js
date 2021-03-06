// export some effects for convenience

import ioType, { simpleBindResult, anyOne } from './ios';

function genIOAction(type) {
  return (...args) => ({
    [ioType]: true,
    type,
    args,
  });
}

export const simpleBind = genIOAction(simpleBindResult);
export const any = genIOAction(anyOne);
