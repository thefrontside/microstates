import { IClass, IDescriptor } from '../Interfaces';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import { filterObject } from 'ioo';

export default function getCallableDescriptors(Class: IClass) {
  let descriptors = getOwnPropertyDescriptors(Class);
  return filterObject(descriptors, (descriptor: IDescriptor, name: string) => {
    return descriptor.value && descriptor.value.call;
  });
}
