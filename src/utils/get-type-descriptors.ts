import { filterObject } from 'ioo';

import { IDescriptor } from '../Interfaces';
import getOwnPropertyDescriptors from './get-own-property-descriptors';

export default function getTypeDescriptors(Class: any) {
  return filterObject(getOwnPropertyDescriptors(Class), (descriptor: IDescriptor, name: string) => {
    let { value } = descriptor;
    return (value && value.call) || Array.isArray(value);
  });
}
