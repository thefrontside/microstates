import { append, map } from 'funcadelic';
import $ from './utils/chain';
import transitionsFor from './utils/transitions-for';

const { keys, defineProperty } = Object;

export default class Tree {
  // value can be either a function or a value.
  constructor({ Type, value, path = [] }) {
    this.Type = Type;
    this.path = path;
    this.stable = {
      value: new Value(value),
      state: new State(this),
      transitions: new Transitions(Type)
    }
  }

  get transitions() {
    return this.stable.transitions.value;
  }

  get state() {
    return this.stable.state.value;
  }

  get value() {
    return this.stable.value.value;
  }

  @memoize  
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
  constructor(Type) {
    this.Type = Type;
  }

  @memoize
  get value() {
    return transitionsFor(this.Type);
  }
}

class Value {
  constructor(valueOrFn) {
    this.valueOrFn = valueOrFn;
  }

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

  @memoize
  get value() {
    let { tree } = this;
    let { Type, value } = this.tree;
    let initial = new Type(value);
    if (keys(tree.children).length > 0) {
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

function memoize(target, key, descriptor) {
  let { get } = descriptor;
  descriptor.get = function memoizedGetter() {
    let value = get.call(this);
    defineProperty(this, key, { value });
    return value;
  }
  return descriptor;
}