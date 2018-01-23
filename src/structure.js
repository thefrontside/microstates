import compose from 'ramda/src/compose';
import $ from './utils/chain';
import { map, append } from 'funcadelic';
import { view, lensTree, lensPath, lensIndex } from './lens';
import Tree from './utils/tree';
import isPrimitive from './utils/is-primitive';
import initialize from './utils/initialize';
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

//  map :: F a -> (a -> b) -> F b
//
//               (a -> b)
//
// flatMap :: F a -> (a -> F b) -> F b
//
//
// flatMap :: O string -> (string -> O json) -> O json
// Observable.of('charts', 'users')
//   .map(endpoint => {
//      return Observable.from($.ajax(`/api/${endpoint}`));
//   })
//   .map(observable => console.log(responseBody))

function getters(Type) {
  return $(getOwnPropertyDescriptors(Type.prototype))
    .filter(({ value }) => !!value.get)
    .map(descriptor => append(descriptor, { enumerable: true }))
    .valueOf();
}

export default class Structure {
  constructor(Type, value = {}) {
    assign(this, { Type, value });
  }

  get types() {
    return toTypeTree(this.Type);
  }

  get values() {
    return map(
      data =>
        Object.create(data, {
          value: { get: () => view(lensPath(data.path), this.value), enumerable: true },
        }),
      this.types
    );
  }

  get states() {
    return map(
      data =>
        Object.create(data, {
          state: {
            get() {
              let { Type, value } = data;
              return Object.create(
                Type.prototype,
                append(getOwnPropertyDescriptors(value), getters(Type))
              );
            },
          },
        }),
      this.values
    );
  }

  // maps the value tree to a set of transitions
  get transitions() {
    return this.states;
  }
}
