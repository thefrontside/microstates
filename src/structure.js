import compose from 'ramda/src/compose';
import $ from './utils/chain';
import { map, append } from 'funcadelic';
import { flatMap } from './monad';
import { view, lensTree, lensPath, lensIndex } from './lens';
import Tree from './utils/tree';
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
  return map(
    data =>
      Object.create(data, {
        value: { get: () => view(lensPath(data.path), value), enumerable: true },
      }),
    typeTree
  );
}

export default class Structure {
  constructor(Type, value = {}) {
    assign(this, { Type, value });
  }

  get types() {
    return toTypeTree(this.Type);
  }

  get values() {
    return toValueTree(this.types, this.value);
  }

  // maps the value tree to a state tree.
  get states() {
    return map({ Type, lens }, this.values);
  }

  // maps the value tree to a set of transitions
  get transitions() {
    return map(transition, this.valueTree);
  }
}
