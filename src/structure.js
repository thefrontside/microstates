import compose from 'ramda/src/compose';
import $ from './utils/chain';
import { map, append } from 'funcadelic';
import { view, set, lensTree, lensPath, lensIndex } from './lens';
import Tree from './utils/tree';
import isPrimitive from './utils/is-primitive';
import initialize from './utils/initialize';
import transitionsFor from './utils/transitions-for';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

const { assign } = Object;

function toTypeTree(Type, path = []) {
  return new Tree({
    data() {
      return { Type, path };
    },
    children() {
      return $(new Type())
        .filter(({ value }) => !!value && value.call)
        .map((ChildType, key) => toTypeTree(ChildType, append(path, key)))
        .valueOf();
    },
  });
}

function toValueTree(typeTree, value) {
  return map(data => Object.create(data, {
    value: {
      get: () => view(lensPath(data.path), value), enumerable: true
    }
  }), typeTree);
}

function gettersOf(Type) {
  return $(getOwnPropertyDescriptors(Type.prototype))
    .filter(({ value }) => !!value.get)
    .map(descriptor => append(descriptor, { enumerable: true }))
    .valueOf();
}

export default function structure(Type, value) {
  let types = toTypeTree(Type);
  let values = toValueTree(types, value);
  return new Structure(values, value);
}

export class Structure {
  constructor(tree, value) {
    assign(this, { tree, value });
  }

  get states() {
    return map(data => Object.create(data, {
      state: {
        get() {
          let { Type, value } = data;
          return Object.create(Type.prototype, append(getOwnPropertyDescriptors(value), gettersOf(Type)));
        }
      }
    }), this.tree);
  }

  // maps the value tree to a set of transitions
  get transitions() {
    return map(data => Object.create(data, {
      transitions: {
        get() {
          let { Type } = data;
          let methods = transitionsFor(Type);
          return map(method => (...args) => {
            let nextLocalValue = method.apply(null, [data.state, ...args]);
            let nextLocalType = data.Type;
            let nextLocalStructure = structure(nextLocalType, nextLocalValue);

            let nextValue = set(lensPath(data.path), nextLocalValue, this.value);
            let nextTree = set(lensTree(data.path), nextLocalStructure.tree, this.tree);
            return new Structure(nextTree, nextValue);
          }, methods);
        }
      }
    }) ,this.states);
  }
}
