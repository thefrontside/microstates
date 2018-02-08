import { append } from 'funcadelic';
import $ from './chain';
import mergeDeepRight from 'ramda/src/mergeDeepRight';
import getPrototypeDescriptors from './get-prototype-descriptors';
import Microstate from '../microstate';
import getType from './get-type';

import isPrimitive from './is-primitive';

const set = function set(current, Type, value) {
  if (arguments.length === 3) {
    return Microstate.create(Type, value);
  } else if (arguments.length === 2 && typeof Type === 'function') {
    return Microstate.create(Type);
  } else if (arguments.length === 2) {
    return Type;
  }
};

const merge = function merge(current, ...args) {
  return mergeDeepRight(current, ...args);
};

export default function transitionsFor(Type) {
  let descriptors = getPrototypeDescriptors(getType(Type));

  let transitionFns = $(descriptors)
    .filter(({ value }) => isFunctionDescriptor(value))
    .map(({ value }) => value)
    .filter(({ key }) => key !== 'constructor')
    .valueOf();

  let common = isPrimitive(Type) ? { set } : { set, merge };
  return append(common, transitionFns);
}

function isFunctionDescriptor(descriptor) {
  return typeof descriptor.value === 'function';
}
