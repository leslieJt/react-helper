export function getValKeyPath(obj, keyPath) {
  let res = obj;
  for (let i = 0; i < keyPath.length; i++) {
    res = res[keyPath[i]];
  }
  return res;
}

export function setValKeyPath(obj, keys, val) {
  const key = keys[0];
  let tempVal;
  if (Array.isArray(obj) || typeof key === 'number') {
    tempVal = Object.assign([], obj);
  } else {
    tempVal = Object.assign({}, obj);
  }
  if (keys.length === 1) {
    tempVal[key] = val;
  } else {
    tempVal[key] = setValKeyPath(obj[key], keys.slice(1), val);
  }
  return tempVal;
}
