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

export function lensTreeChild(key) {
  function get(tree) {
    return key == null || key === '' ? tree : tree.children[key];
  }
  function set(newTree, tree) {
    if (key == null || key === '') {
      return new Tree({
        data: () => newTree.data,
        children: () => tree.children,
      });
    }
    return new Tree({
      data: () => tree.data,
      children: () =>
        map((child, childKey) => {
          if (key === childKey) {
            return new Tree({
              data: () => newTree.data,
              children: () => child.children,
            });
          } else {
            return child;
          }
        }, tree.children),
    });
  }
  return lens(get, set);
}

export function lensTree2(path = []) {
  return compose(...path.map(key => lensTreeChild(key)));
}

export function lensTree(path = []) {
  function get(tree) {
    return foldl(
      (t, key) => {
        return t.children[key];
      },
      tree,
      path
    );
  }

  function set(newTree, tree) {
    function _set(newTree, tree, path) {
      if (path.length === 0) {
        return new Tree({
          data: () => newTree.data,
          children: () => tree.children,
        });
      } else {
        let [current, ...rest] = path;
        return new Tree({
          data: () => tree.data,
          children: () =>
            map((child, key) => {
              if (key === current) {
                return _set(newTree, child, rest);
              } else {
                return child;
              }
            }, tree.children),
        });
      }
    }
    return _set(newTree, tree, path);
  }

  return lens(get, set);
}
