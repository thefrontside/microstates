import { IDescriptor } from '../Interfaces';
import { filterObject } from 'ioo';
import getOwnPropertyDescriptors from './getOwnPropertyDescriptors';

export default function getTypeDescriptors(Class: any) {
  return filterObject(getOwnPropertyDescriptors(Class), (descriptor: IDescriptor, name: string) => {
    let { value } = descriptor;
    return (value && value.call) || Array.isArray(value);
  });
}
