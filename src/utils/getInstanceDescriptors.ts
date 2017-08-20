import { IClass } from '../Interfaces';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import { filterObject } from 'ioo';

export default function getInstanceDescriptors(Class: IClass) {
  let descriptors = getOwnPropertyDescriptors(new Class());
  return filterObject(descriptors, (descriptor, name) => {
    return typeof descriptor.value === 'function';
  });
}
