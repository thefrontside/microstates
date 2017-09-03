import { IDescriptor } from '../Interfaces';
import { filterObject } from 'ioo';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';


export default function getTypeDescriptors(Class: any) {
  let descriptors = getOwnPropertyDescriptors(Class);
  return filterObject(descriptors, (descriptor: IDescriptor, name: string) => {
    let { value } = descriptor;
    return (value && value.call) || Array.isArray(value);
  });
}
