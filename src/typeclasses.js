import { Applicative, Functor, map, append } from 'funcadelic';
import { Monad, flatMap } from './monad';
import Microstate from './microstate';
import { reveal } from './utils/secret';
import Tree from './utils/tree';
import { Collapse, collapse } from './typeclasses/collapse';
import thunk from './thunk';
import truncate from './truncate';
import State from './typeclasses/state';
import Value from './typeclasses/value';
import { Node } from './structure';

const { keys } = Object;

function invoke({ method, args, value, tree}) {
  let unshifted = map(node => node.isShifted ? new Node(node.Type, node.path) : node, tree);
  let nextValue = method.apply(new Microstate(unshifted, value), args);
  if (nextValue instanceof Microstate) {
    return reveal(nextValue);
  } else {
    return { tree: unshifted, value: nextValue };
  }
}

Functor.instance(Microstate, {
  map(fn, microstate) {
    let { tree, value } = reveal(microstate);

    // tree of transitions
    let next = map(node => {
      
      let collapsed = collapse(new Value(tree, value));
      let transitions = node.transitionsAt(collapsed, tree, invoke);

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
    let hasChildren = tree.data && !!keys(tree.children).length;
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
});

Collapse.instance(Value, {
  collapse(value) {
    let truncated = truncate(node => node.isSimple || node.isShifted, value.tree);
    return collapse(map(node => node.valueAt(value.value), truncated));
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
