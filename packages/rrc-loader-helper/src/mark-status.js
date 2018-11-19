const currentRunningMarking = [];

export default function markStatus(loadingStatusName) {
  currentRunningMarking[currentRunningMarking.length - 1].push(loadingStatusName);
}

export function pushRunningStack(frame = []) {
  const currentFrame = frame;
  currentRunningMarking.push(currentFrame);
  return currentFrame;
}

export function popRunningStack() {
  currentRunningMarking.pop();
}
