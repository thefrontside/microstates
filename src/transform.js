import { flatMap, map } from 'funcadelic';
import { params } from './types/parameters0';

export default function transform(fn, microstate) {
  return map(tree => flatMap(current => {
    if (current.is(tree)) {
      return current.assign({
        meta: {
          children() {
            let { T } = params(current.Type);
            return fn(current.children, T);
          }
        }
      })
    } else {
      return current;
    }
  }, tree), microstate);
}