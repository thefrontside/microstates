import { Applicative, Functor, map } from 'funcadelic';
import { Monad, flatMap } from './monad';
import { Microstate } from './microstate';
import { reveal } from './utils/secret';
import Tree from './utils/tree';

Functor.instance(Microstate, {
  map(fn, microstate) {
    let tree = reveal(microstate);
    let structure = map(node => fn(node), tree);
    return new Microstate(structure);
  },
});

Functor.instance(Tree, {
  /**
   * Lazily invoke callback on every property of given tree,
   * the return value is assigned to property value.
   *
   * @param {*} fn (TypeTree, path) => any
   * @param {*} tree Tree
   */
  map(fn, tree) {
    return new Tree({
      data() {
        return fn(tree.data);
      },
      children() {
        return map(child => map(fn, child), tree.children);
      },
    });
  },
});

Applicative.instance(Tree, {
  pure(value) {
    return new Tree({
      data() {
        return value;
      },
    });
  },
});

function thunk(fn) {
  let evaluated = false;
  let result = undefined;
  return function evaluate() {
    if (evaluated) {
      return result;
    } else {
      result = fn();
      evaluated = true;
      return result;
    }
  };
}

Monad.instance(Tree, {
  flatMap(fn, tree) {
    let next = thunk(() => fn(tree.data));
    return new Tree({
      data() {
        return next().data;
      },
      children() {
        return map(child => flatMap(fn, child), next().children);
      },
    });
  },
});
