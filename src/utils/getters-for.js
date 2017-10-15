import { append, filter, map } from 'funcadelic';

import getOwnPropertyDescriptors from './get-own-property-descriptors';

export default function gettersFor(Type) {
  let descriptors = filter(({ value }) => !!value.get, getOwnPropertyDescriptors(Type.prototype));

  return Object.create(
    Object,
    map(descriptor => append(descriptor, { enumerable: true }), descriptors)
  );
}
