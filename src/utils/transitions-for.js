import { append, filter, map } from 'funcadelic';
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import getOwnPropertyDescriptors from './get-own-property-descriptors';
import getReducerType from './get-reducer-type';
import isPrimitive from './is-primitive';
import transition from './transition';

const set = transition(function set(current, state) {
  return state;
});

const merge = transition(function merge(current, state) {
  return mergeDeepRight(current, state);
});

export default function transitionsFor(Type) {
  let type = getReducerType(Type);

  let descriptors = getOwnPropertyDescriptors(type.prototype);
  let methods = filter(({ value }) => isFunctionDescriptor(value), descriptors);

  let transitionFns = filter(
    ({ key }) => !['constructor', 'initialize'].includes(key),
    map(({ value }) => value, methods)
  );

  let common = isPrimitive(Type) ? { set } : { set, merge };
  return append(common, map(fn => transition(fn), transitionFns));
}

function isFunctionDescriptor(descriptor) {
  return typeof descriptor.value === 'function';
}
