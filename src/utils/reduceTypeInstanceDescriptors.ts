import defineComputedProperty from './defineComputedProperty';
import { IClass, IDescriptor } from '../Interfaces';
import { reduceObject, filterObject } from 'ioo';
import ComputedProperty from './ComputedProperty';
import getTypeDescriptors from './getTypeDescriptors';

export default function reduceTypeInstanceDescriptors(
  Class: IClass,
  callback: (descriptor: IDescriptor, name: string) => any,
  attributes = {}
) {
  let instance = new Class();
  instance = reduceObject(
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
  return instance;
}
