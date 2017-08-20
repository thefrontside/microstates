import { IActionsObject, IClass } from '../Interfaces';
import { reduceObject } from 'ioo';
import ComputedProperty from './ComputedProperty';
import getInstanceDescriptors from './getInstanceDescriptors';

export default function wrapProps(
  Class: IClass,
  callback: (value: any, name: string) => any,
  attributes = {}
) {
  return reduceObject(
    getInstanceDescriptors(Class),
    (object, action, name: string) => {
      let cached = new ComputedProperty(() => {
        return callback(action, name);
      }, attributes);
      Object.defineProperty(object, name, cached);
      return object;
    },
    new Class()
  );
}
