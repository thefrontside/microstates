export { default as lens } from 'ramda/src/lens';
export { default as view } from 'ramda/src/view';
export { default as set } from 'ramda/src/set';
export { default as lensPath } from 'ramda/src/lensPath';
export { default as lensIndex } from 'ramda/src/lensIndex';
export { default as compose } from 'ramda/src/compose';

import lens from 'ramda/src/lens';
import compose from 'ramda/src/compose';
import Tree from './utils/tree';
import { map, foldl } from 'funcadelic';

export function lensTree(path = []) {
  function get(tree) {
    return foldl((subtree, key) => subtree.children[key], tree, path);
  }

  function set(newTree, tree, current = path) {
    if (current.length === 0) {
      return newTree;
    } else {
      return new Tree({
        data: () => tree.data,
        children: () =>
          map((child, childName) => {
            let [key, ...rest] = current;
            if (key === childName) {
              return set(newTree, child, rest);
            } else {
              return child;
            }
          }, tree.children),
      });
    }
  }

  return lens(get, set);
}
