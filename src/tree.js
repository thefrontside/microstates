import { append, map } from 'funcadelic';
import { toType } from './types';

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

  get hasChildren() {
    return keys(this.children).length > 0
  }

  // transitions are cached but are unique for every tree instance
  @stable
  get transitions() {
    return new Transitions(this).value;
  }

  get state() {
    return this.stable.state.value;
  }

  get value() {
    return this.stable.value.value;
  }

  @stable
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
  descriptor.get = function memoizedGetter() {
    let value = get.call(this);
    defineProperty(this, key, { value });
    return value;
  }
  return descriptor;
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

