import lensPath from 'ramda/src/lensPath';
import lensIndex from 'ramda/src/lensIndex';
import view from 'ramda/src/view';
import compose from 'ramda/src/compose';
import $ from './utils/chain';
import { map, append } from 'funcadelic';
import { flatMap } from './monad';
import Tree from './utils/tree';
const { assign } = Object;
import ArrayState from './types/array';
import ObjectState from './types/object';

export function toTypeTree(Type, lens = lensPath([])) {
  return new Tree({
    data() {
      return { Type, lens };
    },
    children() {
      // TODO: Make this polymorphic.
      return $(new Type())
        .filter(({ value }) => !!value && value.call)
        .map((ChildType, key) => toTypeTree(ChildType, compose(lens, lensPath([key]))))
        .valueOf();
    },
  });
}

export function toValueTree(typeTree, value) {
  return flatMap(data => {
    return new Tree({
      data() {
        return data;
      },
      children() {
        // TODO: Make this polymorphic.
        let { Type, lens } = data;
        if (Type === ArrayState) {
          // array map is eager, so need to find a way to make this
          // lazy.
          return map((member, i) => {
            return toTypeTree(ObjectState, compose(lens, lensIndex(i)));
          }, view(lens, value));
        } else {
          return $(new Type())
            .filter(({ value }) => !!value && value.call)
            .map((ChildType, key) => toTypeTree(ChildType, compose(lens, lensPath([key]))))
            .valueOf();
        }
      },
    });
  }, typeTree);
}

export default class Structure {
  constructor(Type, value) {
    assign(this, { Type, value });
  }

  get typeTree() {
    return toTypeTree(this.Type);
  }

  get valueTree() {
    return toValueTree(this.typeTree, this.value);
  }

  // maps the value tree to a state tree.
  get stateTree() {
    let { value } = this;
    return map({ Type, lens }, this.valueTree);
  }

  // maps the value tree to a set of transitions
  get transitionTree() {
    return map(transition, this.valueTree);
  }
}
