import defineComputedProperty from './defineComputedProperty';
import { IClass, IDescriptor } from '../Interfaces';
import { reduceObject } from 'ioo';
import ComputedProperty from './ComputedProperty';
import getCallableDescriptors from './getCallableDescriptors';

export default function reduceCallableInstanceDescriptors(
  Class: IClass,
  callback: (descriptor: IDescriptor, name: string) => any,
  attributes = {}
) {
  let instance = new Class();
  return reduceObject(
    getCallableDescriptors(instance),
    (object, action, name: string) => {
      defineComputedProperty(
        object,
        name,
        function() {
          return callback(action, name);
        },
        attributes
      );
      return object;
    },
    instance
  );
}
