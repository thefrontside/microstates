import { reduceObject } from 'ioo';
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import MicrostateObject from '../primitives/object';
import getReducerType from './get-reducer-type';
import getTypeDescriptors from './get-type-descriptors';
import transition from './transition';

export default function transitionsFor(Type) {
  let type = getReducerType(Type);
  let transitions = reduceObject(
    getTypeDescriptors(type.prototype),
    (accumulator, descriptor, name) => {
      return Object.assign({}, accumulator, {
        [name]: name === 'initialize' ? descriptor.value : transition(descriptor.value),
      });
    },
    {
      set: transition(function set(current, state) {
        return state && state.valueOf ? state.valueOf() : state;
      }),
    }
  );
  let isComposed = type === Type;
  if (isComposed || type === MicrostateObject) {
    transitions = Object.assign({}, transitions, {
      merge: transition(function merge(current, state) {
        return mergeDeepRight(current, state && state.valueOf ? state.valueOf() : state);
      }),
    });
  }
  if (isComposed && !transitions.initialize) {
    transitions = Object.assign({}, transitions, {
      initialize: function initialize(current, ...args) {
        return new Type(...args);
      },
    });
  }
  return transitions;
}
