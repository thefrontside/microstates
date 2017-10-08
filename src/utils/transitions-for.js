import { append, filter, map } from 'funcadelic';
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import getOwnPropertyDescriptors from './get-own-property-descriptors';
import getReducerType from './get-reducer-type';
import isPrimitive from './is-primitive';
import transition from './transition';

const set = transition(function set(current, state) {
  return state && state.valueOf ? state.valueOf() : state;
});

const merge = transition(function merge(current, state) {
  return mergeDeepRight(current, state && state.valueOf ? state.valueOf() : state);
});

export default function transitionsFor(Type) {
  let type = getReducerType(Type);
  let descriptors = getOwnPropertyDescriptors(type.prototype);
  let transitionFns = filter(
    ({ key }) => !['constructor', 'initialize'].includes(key),
    map(
      ({ value: descriptor }) => descriptor.value,
      filter(({ value: descriptor }) => typeof descriptor.value === 'function', descriptors)
    )
  );
  let commonTransitions = isPrimitive(Type) ? { set } : { set, merge };
  return append(commonTransitions, map(fn => transition(fn), transitionFns));
}
