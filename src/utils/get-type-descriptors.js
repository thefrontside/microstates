import { filterObject } from 'ioo';

import getOwnPropertyDescriptors from './get-own-property-descriptors';

export default function getTypeDescriptors(Class) {
  // console.log({ Class, descriptors: getOwnPropertyDescriptors(Class.prototype) });
  return filterObject(getOwnPropertyDescriptors(Class), (descriptor, name) => {
    return descriptor.value && descriptor.value.call;
  });
}
