import { append, filter, map } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

export default function gettersFor(Type) {
  let descriptors = filter(({ value }) => !!value.get, getOwnPropertyDescriptors(Type.prototype));

  return Object.create(
    Type.prototype,
    map(descriptor => append(descriptor, { enumerable: true }), descriptors)
  );
}
