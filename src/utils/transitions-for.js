import { append, filter, map } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import isPrimitive from './is-primitive';
import transition from './transition';

const set = transition(function set(current, state) {
  return state;
});

const merge = transition(function merge(current, state) {
  return mergeDeepRight(current, state);
});

export default function transitionsFor(Type) {
  let descriptors = getOwnPropertyDescriptors(Type.prototype);
  let methods = filter(({ value }) => isFunctionDescriptor(value), descriptors);

  let transitionFns = filter(
    ({ key }) => key !== 'constructor',
    map(({ value }) => value, methods)
  );

  let common = isPrimitive(Type) ? { set } : { set, merge };
  return append(common, map(fn => transition(fn), transitionFns));
}

function isFunctionDescriptor(descriptor) {
  return typeof descriptor.value === 'function';
}
