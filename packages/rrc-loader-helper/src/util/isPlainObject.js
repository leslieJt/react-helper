/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;

  const proto = Object.getPrototypeOf(obj);
  if (proto === null) return true;

  let baseProto = proto;
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto);
  }

  return proto === baseProto;
}

export function isPrimitive(v) {
  const type = typeof v;
  return v == null || type === 'string' || type === 'number' || type === 'boolean' || type === 'symbol';
}
