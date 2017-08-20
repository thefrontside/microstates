import { IClass } from '../Interfaces';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import { filterObject } from 'ioo';

export default function getStaticDescriptors(Class: IClass) {
  let descriptors = getOwnPropertyDescriptors(Class);
  return filterObject(descriptors, (descriptor, name) => {
    return typeof descriptor.value === 'function';
  });
}
