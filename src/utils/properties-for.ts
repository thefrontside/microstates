import { reduceObject } from 'ioo';

import { IClass, ISchema } from '../Interfaces';
import getTypeDescriptors from './getTypeDescriptors';

export default function propertiesFor(Type: ISchema) {
  return reduceObject(
    getTypeDescriptors(new (Type as IClass)()),
    (accumulator, descriptor, name: string) => {
      return {
        ...accumulator,
        [name]: descriptor.value,
      };
    }
  );
}
