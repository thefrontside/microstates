import { append } from 'funcadelic';
import $ from './chain';
import mergeDeepRight from 'ramda/src/mergeDeepRight';
import getPrototypeDescriptors from './get-prototype-descriptors';
import Microstate from '../microstate';
import { toType } from '../types';

import isPrimitive from './is-primitive';

function setTransition(value) {
  return value;
};

function mergeTransition(...args) {
  return mergeDeepRight(this.state, ...args);
};

export default function transitionsFor(Type) {
  let descriptors = getPrototypeDescriptors(toType(Type));

  let transitionFns = $(descriptors)
    .filter(({ value }) => isFunctionDescriptor(value))
    .map(({ value }) => value)
    .filter(({ key }) => key !== 'constructor')
    .valueOf();

  let common = isPrimitive(Type) ? { set: setTransition } : { set: setTransition, merge: mergeTransition };
  return append(common, transitionFns);
}

function isFunctionDescriptor(descriptor) {
  return typeof descriptor.value === 'function';
}
