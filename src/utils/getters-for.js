import $ from './chain';
import { append, filter, map } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

export default function gettersFor(Type) {
  let descriptors = $(getOwnPropertyDescriptors(Type.prototype))
    .filter(({ value }) => !!value.get)
    .map(descriptor => append(descriptor, { enumerable: true }))
    .valueOf();

  return Object.create(Type.prototype, descriptors);
}
