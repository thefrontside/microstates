import { Applicative, Functor, map, append, Monad, flatMap } from 'funcadelic';
import Microstate from './microstate';
import { reveal } from './utils/secret';
import Tree from './utils/tree';
import thunk from './thunk';
import { collapse } from './typeclasses/collapse';

const { keys } = Object;

function invoke({ method, args, value, tree}) {
  let nextValue = method.apply(new Microstate(tree), args);
  if (nextValue instanceof Microstate) {
    let tree = reveal(nextValue);
    return { tree, value: tree.data.value };
  } else if (nextValue === value ) {
    return { tree, value };
  } else {
    return { tree, value: nextValue };
  }
}

Functor.instance(Microstate, {
  map(fn, microstate) {
    let _tree = reveal(microstate);

    // tree of transitions
    let next = map(node => {
      return map(transition => {
        return (...args) => {
          let { tree } = transition(_tree, invoke)(...args);
          return new Microstate(tree);
        };
      }, node.transitions);
    }, _tree);

    let mapped = map(transitions => map(fn, transitions), next);

    return append(microstate, collapse(mapped));
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
    return append(tree, {
      get data() {
        return fn(tree.data);
      },
      get children() {
        return map(child => map(fn, child), tree.children);
      },
    })
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
    return append(tree, {
      get data() {
        return next().data;
      },
      get children() {
        return map(child => flatMap(fn, child), next().children);
      }
    });
  },
});
