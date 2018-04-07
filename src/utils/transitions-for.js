import { append } from 'funcadelic';
import $ from './chain';
import getPrototypeDescriptors from './get-prototype-descriptors';
import { toType } from '../types';

function setTransition(value) {
  return value;
};

export default function transitionsFor(Type) {
  let descriptors = getPrototypeDescriptors(toType(Type));

  let transitionFns = $(descriptors)
    .filter(({ value }) => isFunctionDescriptor(value))
    .map(({ value }) => value)
    .filter(({ key }) => key !== 'constructor')
    .valueOf();

  return append(transitionFns, { set: setTransition });
}

function isFunctionDescriptor(descriptor) {
  return typeof descriptor.value === 'function';
}
