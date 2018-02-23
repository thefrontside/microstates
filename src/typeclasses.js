import { Applicative, Functor, map, append } from 'funcadelic';
import { Monad, flatMap } from './monad';
import Microstate from './microstate';
import { reveal } from './utils/secret';
import Tree from './utils/tree';
import thunk from './thunk';

function invoke({ method, args, value, tree}) {
  let nextValue = method.apply(new Microstate(tree, value), args);
  if (nextValue instanceof Microstate) {
    return reveal(nextValue);
  } else {
    return { tree, value: nextValue };
  }
}

Functor.instance(Microstate, {
  map(fn, microstate) {
    let { tree, value } = reveal(microstate);

    // tree of transitions
    let next = map(node => {
      let transitions = node.transitionsAt(value, tree, invoke);      
      return map(transition => {
        return (...args) => {
          let { tree, value } = transition(...args);
          return new Microstate(tree, value);
        };
      }, transitions)
    }, tree);

    let mapped = map(transitions => map(fn, transitions), next);

    return append(microstate, mapped.collapsed);
  }
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