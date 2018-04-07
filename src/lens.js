export { default as lens } from 'ramda/src/lens';
export { default as view } from 'ramda/src/view';
export { default as set } from 'ramda/src/set';
export { default as over } from 'ramda/src/over';
export { default as lensPath } from 'ramda/src/lensPath';
export { default as lensIndex } from 'ramda/src/lensIndex';
export { default as compose } from 'ramda/src/compose';

import lens from 'ramda/src/lens';
import view from 'ramda/src/view';
import Tree from './utils/tree';
import { map, foldl } from 'funcadelic';

export function lensTreeValue(path = []) {
  function get(tree) {
    return foldl((subtree, key) => subtree.children[key], tree, path);
  }

  function set(subtree, tree, current = path) {
    if (current.length === 0) {
      return subtree;
    } else {
      return new Tree({
        data: () => {
          let [key, ...rest] = current;
          return tree.data.replaceValue(key, subtree.data.value);
        },
        children: () =>
          map((child, childName) => {
            let [key, ...rest] = current;
            if (key === childName) {
              return set(subtree, child, rest);
            } else {
              return child;
            }
          }, tree.children),
      });
    }
  }

  return lens(get, set);
}
