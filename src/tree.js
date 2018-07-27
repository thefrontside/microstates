import { foldl } from 'funcadelic';
import { over, ValueAt } from './lens';

export function treemap(visit, childrenOf, transform, object, path = []) {
  if (object != null && visit(object)) {
    return foldl((result, { key, value }) => {
      return over(ValueAt(key), () => treemap(visit, childrenOf, transform, value, path.concat(key)), result);
    }, transform(object, path), childrenOf(object));
  } else {
    return object;
  }
}
