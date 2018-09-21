import { foldl } from 'funcadelic';
import { over, ValueAt } from './lens';

function visit(object) {
  return object != null && object.constructor.isMicrostateType;
}

export function treemap(childrenOf, transform, object, path = []) {
  if (object != null && visit(object)) {
    return foldl((result, { key, value }) => {
      return over(ValueAt(key), () => treemap(childrenOf, transform, value, path.concat(key)), result);
    }, transform(object, path), childrenOf(object));
  } else {
    return object;
  }
}
