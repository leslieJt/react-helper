const markStatusStack = [];

export default function markStatus(loadingStatusName) {
  markStatusStack[markStatusStack.length - 1].push(loadingStatusName);
}

function pushRunningStack(frame = []) {
  const currentFrame = frame;
  markStatusStack.push(currentFrame);
  return currentFrame;
}

function popRunningStack() {
  markStatusStack.pop();
}

// markStatus will generate a paired extra yield
// return a promise is ok, because promise.then is recursive
export function addLifecycle(gen, {
  onAddStatus, onOk, onError, onYield
}) {
  return function* generatedFunction({ '@@INNER/DONE_MARK': doneMark, ...action } = {}) {
    let currentFrame = pushRunningStack();
    try {
      const it = gen(action);
      let val;
      let nextAction = 'next';
      while (true) {
        const frameSnapshot = [...currentFrame];
        const { done, value } = it[nextAction](val);
        nextAction = 'next';
        if (done) {
          currentFrame = frameSnapshot;
          val = value;
          break;
        }
        try {
          const addedStatus = currentFrame.slice(frameSnapshot.length);
          if (addedStatus.length) {
            yield onAddStatus(addedStatus);
          }
          popRunningStack();
          val = yield onYield(value);
        } catch (e) {
          nextAction = 'throw';
          val = e;
        }
        pushRunningStack(currentFrame);
      }
      if (currentFrame.length) {
        yield onOk(currentFrame);
      }
      if (doneMark) {
        doneMark.resolve(val);
      }
      return val;
    } catch (e) {
      if (currentFrame.length) {
        yield onError(currentFrame);
      }
      if (doneMark) {
        doneMark.reject(e);
      }
      throw e;
    } finally {
      popRunningStack();
    }
  };
}
