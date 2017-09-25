import { reduceObject } from 'ioo';

import { ISchema } from '../Interfaces';
import getTypeDescriptors from './get-type-descriptors';

export default function propertiesFor(Type: ISchema) {
  return reduceObject(
    getTypeDescriptors(new (Type as ISchema)()),
    (accumulator, descriptor, name: string) => {
      return {
        ...accumulator,
        [name]: descriptor.value,
      };
    }
  );
}
