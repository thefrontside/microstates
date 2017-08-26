import { IClass, IDescriptor } from '../Interfaces';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import { filterObject } from 'ioo';

export default function getTypeDescriptors(Class: any) {
  let descriptors = getOwnPropertyDescriptors(Class);
  return filterObject(descriptors, (descriptor: IDescriptor, name: string) => {
    let { value } = descriptor;
    return (value && value.call) || Array.isArray(value);
  });
}
