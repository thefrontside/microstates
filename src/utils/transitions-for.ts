import { reduceObject } from 'ioo';
import * as mergeDeepRight from 'ramda/src/mergeDeepRight';

import { ISchema, ITransitionMap } from '../Interfaces';
import MicrostateObject from '../primitives/object';
import getReducerType from './get-reducer-type';
import getTypeDescriptors from './get-type-descriptors';
import transition from './transition';

export default function transitionsFor(Type: ISchema): ITransitionMap {
  let type = getReducerType(Type);

  let transitions = reduceObject(
    getTypeDescriptors(type.prototype),
    (accumulator, descriptor, name) => {
      return {
        ...accumulator,
        [name]: name === 'initialize' ? descriptor.value : transition(descriptor.value),
      };
    },
    {
      set: transition(function set(current: any, state: any) {
        return state && state.valueOf ? state.valueOf() : state;
      }),
    }
  );

  let isComposed = type === Type;
  if (isComposed || type === MicrostateObject) {
    transitions = {
      ...transitions,
      merge: transition(function merge(current, state) {
        return mergeDeepRight(current, state && state.valueOf ? state.valueOf() : state);
      }),
    };
  }

  if (isComposed && !transitions.initialize) {
    transitions = {
      ...transitions,
      initialize: function initialize(current: any, ...args: any[]) {
        return new (Type as ISchema)(...args);
      },
    };
  }

  return transitions;
}
