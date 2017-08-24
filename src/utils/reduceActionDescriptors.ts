import defineComputedProperty from './defineComputedProperty';
import { reduceObject } from 'ioo';
import { IAction, IAttributeOverrides, IDescriptorMap } from '../Interfaces';

export default function reduceActionDescriptors(
  descriptors: IDescriptorMap,
  callback: (action: IAction, name: string) => any,
  attributes: IAttributeOverrides
) {
  return reduceObject(
    descriptors,
    (accumulator, descriptor, name: string) => {
      defineComputedProperty(
        accumulator,
        name,
        function() {
          return callback(descriptor.value, name as string);
        },
        attributes
      );
      return accumulator;
    },
    {}
  );
}
