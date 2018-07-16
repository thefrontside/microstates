import { Functor, Monad, map } from 'funcadelic';
import { lensPath, set as lset } from './lens';
import keys from './keys';
import Tree, { Microstate, stateFromTree } from './tree';
import { reveal } from './utils/secret';

Functor.instance(Microstate, { 
  map(fn, microstate) {
    return fn(reveal(microstate)).microstate
  } 
});

/**
 * Tree Functor allows a developer to map a tree without changing
 * the tree's structure. The functor instance will enforce maintaing
 * the structure by copying over Type and overriding returned chidren.
 *
 * The purpose of this mechanism is to allow a developer to change the
 * path of a tree and cary over the stable value or change the value
 * for a tree of the same structure.
 *
 * To change the path and keep stable values,
 * ```
 * map(tree => ({ path: compute(tree.path) }), tree)
 * ```
 *
 * To change the stable values,
 * ```
 * map(tree => new Tree({ Type: tree.Type, value }), tree)
 * ```
 */
Functor.instance(Tree, {
  map(fn, tree) {

    function remap(fn, tree, root) {
      return tree.derive(function deriveInFunctor(instance) {
        return fn(tree).assign({
          meta: {
            Type: tree.Type,
            root() { 
              return root || instance 
            },
            children() {
              return map(child => remap(fn, child, root || instance), tree.children);
            }
          }
        })
      });
    }

    return remap(fn, tree);
  }
});

Monad.instance(Tree, {

  /**
   * Enclose any value into the most essential Type tree.
   * In this instance, it takes any value, and places it in a tree
   * whose  type is `Any` (which is basically an id type).
   */
  pure(value) {
    return new Tree({ value });
  },

  /**
   * Recursively alter the structure of a Tree.
   *
   * The flat mapping function is invoked on each node in the tree's
   * graph. The returned Tree's `Type`, `value`, `stable` and
   * `children` properties will replace the existing tree in the
   * return vlaue. However, the `path` attribute may not be
   * altered. This is because the flat mapped node must _necessarily_
   * occupy the exact same position in the tree as the node it was
   * mapped from.
   *
   * The flat mapping function is applied recursively to the
   * children of the Tree _returned_ by the mapping function, not the
   * children of the original tree.
   *
   * TODO: Since the mapping function can alter the value of a
   * node in the tree, is it the responsibility of `flatMap` to
   * percolate that value change all the way up to the root of the
   * ultimately returned tree?
   */
  flatMap(fn, tree) {
    function reflatmap(fn, tree, root) {
      return tree.derive(function deriveInMonad(instance) {
        let mapped = fn(tree);

        return mapped.assign({
          meta: { 
            root: root || instance,
            children() {
              return map(child => {
                return reflatmap(tree => {
                  return fn(tree.prune()).graft(tree.path, root || instance);
                }, child, root || instance);
              }, mapped.children);
            }
          },
          data: {
              value() {
                let { value } = mapped;
                if (instance.hasChildren && value !== undefined) {
                  if (Array.isArray(instance.children)) {
                    return map(child => child.value, instance.children);
                  } else {
                    return keys(instance.children).reduce((value, key) => {
                      let oldValue = tree.children[key] && tree.children[key].value;
                      let newValue = instance.children[key].value;
                      if (oldValue === newValue) {
                        return value;
                      } else {
                        return lset(lensPath([key]), newValue, value);
                      }
                    }, value);
                  }
                }
                return value;
              },
              state(instance) {
                if (instance.isEqual(tree)) {
                  return tree.state;
                } else {
                  return stateFromTree(instance);
                }
              }
            }
        });
      });
    }

    return reflatmap(fn, tree);
  }
});