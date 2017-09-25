import { filterObject } from 'ioo';

import { IDescriptor } from '../Interfaces';
import getOwnPropertyDescriptors from './get-own-property-descriptors';

export default function getTypeDescriptors(Class: any) {
  // console.log({ Class, descriptors: getOwnPropertyDescriptors(Class.prototype) });
  return filterObject(getOwnPropertyDescriptors(Class), (descriptor: IDescriptor, name: string) => {
    return descriptor.value && descriptor.value.call;
  });
}
