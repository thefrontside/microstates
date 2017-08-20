import { filterObject, get } from 'ioo';
import { IMapCallback } from 'ioo/dist/Interfaces';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

import { IDescriptor } from '../Interfaces';
import wrapProps from './wrapProps';

export default function mapStaticProps(
  Class,
  callback: (descriptor: IDescriptor, name: string) => any,
  attributes = {}
) {
  let descriptors = getOwnPropertyDescriptors(new Class());
  let props = filterObject(descriptors, (descriptor, name) => {
    return typeof descriptor.value === 'function';
  });

  return wrapProps(props, callback, attributes);
}
