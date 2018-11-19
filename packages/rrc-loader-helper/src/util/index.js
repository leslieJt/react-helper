import {
  mappingVal,
} from './mapping';
import { getValKeyPath }from './obj_key_path_ops';

export function getMappingVal(obj, keyPath, mapping) {
  const rawRes = getValKeyPath(obj, keyPath);
  if (mapping) {
    return mappingVal(rawRes, mapping);
  }
  return rawRes;
}

export getCachedFunction  from './cached_function';
