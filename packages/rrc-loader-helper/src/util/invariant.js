const NODE_ENV = process.env.NODE_ENV;

// similar to `https://github.com/zertosh/invariant`, but more simple.
export default function invariant(condition, message) {
  if (!condition) {
    if (NODE_ENV !== 'production') {
      throw new Error(message);
    }
    return false;
  }
  return true;
}
