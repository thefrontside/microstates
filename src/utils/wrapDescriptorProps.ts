import ComputedProperty from './ComputedProperty';
import { reduceObject } from 'ioo';
import { IAction, IClass, IDescriptorHash } from '../Interfaces';
import getStaticDescriptors from './getStaticDescriptors';

export default function wrapDescriptorProps(
  Class: IClass,
  callback: (action: IAction, name: string) => any,
  attributes: {}
) {
  return reduceObject(
    getStaticDescriptors(Class),
    (object, descriptor, name) => {
      let cached = new ComputedProperty(() => {
        return callback(descriptor.value, name as string);
      }, attributes);
      Object.defineProperty(object, name, cached);
      return object;
    },
    {}
  );
}
