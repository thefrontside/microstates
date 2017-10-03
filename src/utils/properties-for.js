import { reduceObject } from 'ioo';

import getTypeDescriptors from './get-type-descriptors';

export default function propertiesFor(Type) {
  return reduceObject(getTypeDescriptors(new Type()), (accumulator, descriptor, name) => {
    return Object.assign({}, accumulator, { [name]: descriptor.value });
  });
}
