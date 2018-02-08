import { append } from 'funcadelic';
import $ from './chain';
import mergeDeepRight from 'ramda/src/mergeDeepRight';
import getPrototypeDescriptors from './get-prototype-descriptors';
import Microstate from '../microstate';
import getType from './get-type';

import isPrimitive from './is-primitive';

const set = function set(Type, value) {
  if (arguments.length === 2) {
    return Microstate.create(Type, value);
  } else if (arguments.length === 1 && typeof Type === 'function') {
    return Microstate.create(Type, this.valueOf());
  } else if (arguments.length === 1) {
    return Type;
  }
};

const merge = function merge(...args) {
  return mergeDeepRight(this.state, ...args);
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
