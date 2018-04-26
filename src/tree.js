import { append, map, Functor } from 'funcadelic';
import { toType } from './types';
import thunk from './thunk';
import $ from './utils/chain';
import getPrototypeDescriptors from './utils/get-prototype-descriptors';

const { assign, keys, defineProperty, defineProperties } = Object;

export default class Tree {
  // value can be either a function or a value.
  constructor({ Type, value, path = [] }) {
    this.Type = Type;
    this.path = path;
    // stable object has all of the data that will be
    // copied to a new tree when mapping trees.
    this.stable = {
      value: new Value(value),
      state: new State(this)
    }
  }

/**
 * Returns a new tree where the current tree is the root. The stable
 * values are carried over to the new tree. 
 */
  prune() {
    return map(tree => ({ path: tree.path.slice(this.path.length)}), this);
  }

  /**
   * Change the path of a tree.
   *
   * This lets you take any tree, sitting at any context and 
   * prefix the context with additional path.
   */
  graft(path = []) {
    if (path.length === 0) {
      return this;
    } else {
      return map(tree => ({ path: [...path, ...tree.path]}), this);
    }
  }

  get hasChildren() {
    return keys(this.children).length > 0
  }

  @stable
  // transitions are stable per tree instance
  get transitions() {
    return new Transitions(this).value;
  }

  // state is stable across mapped trees
  get state() {
    return this.stable.state.value;
  }

  // value is stable across mapped trees
  get value() {
    return this.stable.value.value;
  }

  @stable
  // children are stable for a tree instance
  get children() {
    let { Type, value, path } = this;
    let childTypes = childTypesAt(Type, value);
    return map((ChildType, childPath) => new Tree({
      Type: ChildType,
      value: () => value[childPath],
      path: append(path, childPath)
    }), childTypes);
  }
}

class Transitions {
  constructor(tree) {
    this.tree = tree;
  }

  @stable
  get value() {
    let { Type, children, hasChildren } = this.tree;
    // this needs to come from some place
    let TransitionsConstructor = transitionsConstructorFor(Type);
    let transitions = new TransitionsConstructor();
    if (hasChildren) {
      return append(transitions, map(child => child.transitions, children));
    } else {
      return transitions;
    }
  }
}

class Value {
  constructor(valueOrFn) {
    this.valueOrFn = valueOrFn;
  }

  @stable
  get value() {
    let { valueOrFn } = this;
    if (typeof valueOrFn === 'function') {
      return valueOrFn();
    } else {
      return valueOrFn;
    }
  }
}

class State {
  constructor(tree) {
    this.tree = tree;
  }

  @stable
  get value() {
    let { tree } = this;
    let { Type, value } = this.tree;
    let initial = new Type(value);
    if (tree.hasChildren) {
      return append(initial, map(child => child.state, tree.children));
    } else {
      return initial.valueOf();
    }
  }
}


function childTypesAt(Type) {
  // return [];
  // if (Type === types.Object || Type.prototype instanceof types.Object || Type === types.Array || Type.prototype instanceof types.Array) {
  //   let { T } = params(Type);
  //   if (T !== any) {
  //     return map(() => T, value);
  //   }
  // }
  return $(new Type())
  // .map(desugar)
    .filter(({ value }) => !!value && value.call)
    .valueOf();
}

/**
 * This descriptor can be applied to a getter. When applied to a getter, 
 * the result of the getter's computation will be cached on first read 
 * and reused on consequent reads.
 */
function stable(target, key, descriptor) {
  let { get } = descriptor;
  descriptor.get = stabilizeOn(key, get);
  return descriptor;
}

function stabilizeOn(key, fn) {
  return function stabilized() {
    let value = fn.call(this);
    defineProperty(this, key, { value });
    return value;
  }
}

function transition(method) {
  return function(...args) {
    return method.apply(this, args);
  }
}

class Any {
  set() {

  }
}

/**
 * This factory takes a class and returns a class.
 */
export function transitionsConstructorFor(Class) {
  class TransitionsConstructor {}
  
  let transitions = $(assign({}, getPrototypeDescriptors(toType(Class)), getPrototypeDescriptors(Any)))
    .filter(({ key, value }) => typeof value.value === 'function' && key !== 'constructor')
    .map(descriptor => assign({}, descriptor, { value: transition(descriptor.value) }))
    .valueOf();

  defineProperties(TransitionsConstructor.prototype, transitions);

  return TransitionsConstructor;
}

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

    let mapped = thunk(() => fn(tree));

    return Object.create(Tree.prototype, {
      Type: {
        enumerable: true, 
        value: tree.Type 
      },
      path: {
        enumerable: true,
        get() {
          let { path } = mapped();
          return path ? path : tree.path;
        }
      },
      stable: {
        enumerable: true,
        get() {
          let { stable } = mapped();
          return stable ? stable : tree.stable;
        }
      },
      children: {
        enumerable: false,
        configurable: true,
        get: stabilizeOn('children', function stableChildren() {
          return map(child => map(fn, child), tree.children);
        })
      }
    })
  }
});

