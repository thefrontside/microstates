import { Applicative, Functor, map, append, foldl } from 'funcadelic';
import { Monad, flatMap } from './monad';
import Microstate from './microstate';
import { reveal } from './utils/secret';
import Tree from './utils/tree';
import { Collapse, collapse } from './typeclasses/collapse';
import thunk from './thunk';
import truncate from './truncate';
import State from './typeclasses/state';
import Value from './typeclasses/value';
import types from './types';
import logTree from './utils/log-tree';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

const { keys, getPrototypeOf } = Object;

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
  collapse({ tree, value }) {
    let truncated = truncate(node => node.isSimple || node.valueAt(value) === undefined, tree);
    let values = map(node => getPrototypeOf(node.Type) === types.Array ? [] : node.valueAt(value), truncated);
    return toPOJO(collapse(values));
  }
});

function toPOJO(value) {
  if (Array.isArray(value)) {
    return map(value => toPOJO(value), value);
  } else if (typeof value === 'object') {
    let descriptors = map(descriptor => ({
      value: descriptor.get ? descriptor.get() : descriptor.value,
      enumerable: descriptor.enumerable
    }), getOwnPropertyDescriptors(value));
    return Object.create(Object.prototype, descriptors);
  }
  return value;
}

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
