import defineComputedProperty from './defineComputedProperty';
import ComputedProperty from './ComputedProperty';
import { reduceObject } from 'ioo';
import { IAction, IDescriptorHash } from '../Interfaces';

export default function reduceActionDescriptors(
  descriptors: IDescriptorHash,
  callback: (action: IAction, name: string) => any,
  attributes: {}
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
