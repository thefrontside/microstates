import defineComputedProperty from './defineComputedProperty';
import { IAttributeOverrides, IClass, IDescriptor } from '../Interfaces';
import { reduceObject, filterObject } from 'ioo';
import ComputedProperty from './ComputedProperty';
import getTypeDescriptors from './getTypeDescriptors';

export default function reduceTypeToCachedTree(
  Class: IClass,
  callback: (descriptor: IDescriptor, name: string) => any,
  attributes: IAttributeOverrides = {}
) {
  let instance = new Class();
  return reduceObject(
    getTypeDescriptors(instance),
    (accumulator, descriptor, name: string) => {
      defineComputedProperty(
        accumulator,
        name,
        function() {
          return callback(descriptor, name);
        },
        attributes
      );
      return accumulator;
    },
    instance
  );
}
