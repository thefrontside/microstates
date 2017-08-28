import defineComputedProperty from './defineComputedProperty';
import { IAttributeOverrides, IClass, IDescriptor } from '../Interfaces';
import { reduceObject, filterObject } from 'ioo';
import ComputedProperty from './ComputedProperty';
import getTypeDescriptors from './getTypeDescriptors';

export default function reduceTypeInstanceDescriptors(
  type: IClass,
  callback: (accumulator: any, descriptor: IDescriptor, name: string) => any,
  initial: any = {}
) {
  let instance = new type();
  return reduceObject(getTypeDescriptors(instance), callback, initial);
}
