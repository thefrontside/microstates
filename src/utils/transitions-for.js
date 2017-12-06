import { append, filter, map } from 'funcadelic';
import mergeDeepRight from 'ramda/src/mergeDeepRight';
import getPrototypeDescriptors from './get-prototype-descriptors';

import isPrimitive from './is-primitive';

const set = function set(current, state) {
  return state;
};

const merge = function merge(current, ...args) {
  return mergeDeepRight(current, ...args);
};

export default function transitionsFor(Type) {
  let descriptors = getPrototypeDescriptors(Type);
  let methods = filter(({ value }) => isFunctionDescriptor(value), descriptors);

  let transitionFns = filter(
    ({ key }) => key !== 'constructor',
    map(({ value }) => value, methods)
  );

  let common = isPrimitive(Type) ? { set } : { set, merge };
  return append(common, transitionFns);
}

function isFunctionDescriptor(descriptor) {
  return typeof descriptor.value === 'function';
}
