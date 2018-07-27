import { foldl, type } from 'funcadelic';
import { over, ValueAt } from './lens';

export const Tree = type(class Tree {

  //TODO: worried this fold is not lazy.
  static map(fn, object, path = []) {
    if (object != null && object[Tree.symbol]) {
      return foldl((result, { key, value }) => {
        return over(ValueAt(key), () => Tree.map(fn, value, path.concat(key)), result);
      }, fn(object, path), childrenOf(object));
    } else {
      return object;
    }
  }
  childrenOf(tree) {
    return this(tree).childrenOf(tree);
  }
});

export const { childrenOf } = Tree.prototype;

export function treemap(visit, childrenOf, transform, object, path = []) {
  if (object != null && visit(object)) {
    return foldl((result, { key, value }) => {
      return over(ValueAt(key), () => treemap(visit, childrenOf, transform, value, path.concat(key)), result);
    }, transform(object, path), childrenOf(object));
  } else {
    return object;
  }
}
