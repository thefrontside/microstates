import { IDescriptor } from '../Interfaces';
import { filterObject } from 'ioo';

export default function getTypeDescriptors(Class: any) {
  let descriptors = Object.getOwnPropertyDescriptors(Class);
  return filterObject(descriptors, (descriptor: IDescriptor, name: string) => {
    let { value } = descriptor;
    return (value && value.call) || Array.isArray(value);
  });
}
