export function stick$refToState(prevState, nextState) {
  const { $ref = {} } = prevState;
  $ref.state = nextState;

  Object.defineProperty(nextState, '$ref', {
    value: $ref,
    enumerable: false,
  });
  return nextState;
}

// 将值用getter绑定到.retain指向的property上
export function setASymlink(state, property, url) {
  if (!Object.prototype.hasOwnProperty.call(state, property)) {
    const { $ref } = state;
    let currentUrl;

    Object.defineProperty(state, property, {
      get() {
        if (!currentUrl || !$ref.state['.retain']) {
          return null;
        }
        return $ref.state['.retain'][currentUrl];
      },
      enumerable: true,
      set(u) {
        currentUrl = u;
      }
    });
  }
  state[property] = url;
}
