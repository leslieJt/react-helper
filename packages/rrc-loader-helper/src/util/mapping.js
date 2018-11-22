export function mappingVal(val, mapping) {
  if (!mapping) return val;
  if (Array.isArray(mapping)) {
    return mapping.reduce((reduced, key, index) => {
      reduced[key] = val[index];
      return reduced;
    }, {});
  }
  if (typeof mapping === 'object') {
    const arr = Object.keys(mapping).map(key => [key, mapping[key]]);
    let init;
    if (typeof arr[0][1] === 'number') {
      init = [];
    } else {
      init = {};
    }
    return arr.reduce((reduced, [key, newKey]) => {
      reduced[newKey] = val[key];
      return reduced;
    }, init);
  }
  console.error('Unexpected argument mapping: ' + mapping + '.\n mapping should be an array or an object');
  return val;
}

export function reverseMappingVal(val, mapping) {
  if (!mapping) return val;
  if (Array.isArray(mapping)) {
    return mapping.reduce((reduced, key, index) => {
      reduced[index] = val[key];
      return reduced;
    }, []);
  }
  if (typeof mapping === 'object') {
    const arr = Object.keys(mapping).map(key => [key, mapping[key]]);
    return arr.reduce((reduced, [newKey, key]) => {
      reduced[newKey] = val[key];
      return reduced;
    }, {});
  }
  console.error('Unexpected argument mapping: ' + mapping + '.\n mapping should be an array or an object');
  return val;
}
