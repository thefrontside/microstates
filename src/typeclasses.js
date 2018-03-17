import { Applicative, Functor, Foldable, map, append, foldr } from 'funcadelic';
import { Monad, flatMap } from './monad';
import Microstate from './microstate';
import { reveal } from './utils/secret';
import Tree from './utils/tree';
import { Collapse, collapse } from './typeclasses/collapse';
import thunk from './thunk';
import truncate from './truncate';
import State from './typeclasses/state';

const { keys } = Object;

function invoke({ method, args, value, tree}) {
  let nextValue = method.apply(new Microstate(tree, value), args);
  if (nextValue instanceof Microstate) {
    return reveal(nextValue);
  } else {
    return { tree, value: nextValue };
  }
}

Foldable.instance(Tree, {
  foldr(fn, initial, tree) {
    return foldr((memo, current) => {
      return fn(memo, {
        key: current.key,
        get value() { return current.value.data }
      });
    }, fn(initial, tree.data), tree.children);
  }
})

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
      }, transitions);
    }, tree);

    let mapped = map(transitions => map(fn, transitions), next);

    return append(microstate, collapse(mapped));
  }
});

Collapse.instance(Tree, {
  collapse(tree) {
    let hasChildren = !!keys(tree.children).length;
    if (hasChildren) {
      return append(tree.data, map(child => collapse(child), tree.children));
    } else {
      return tree.data;
    }
  }
});

Collapse.instance(State, {
  collapse(state) {
    let truncated = truncate(node => node.isSimple, state.tree);
    return collapse(map(node => node.stateAt(state.value), truncated)); 
  }
})

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
      }
    });
  }
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
