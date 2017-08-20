import { IMapCallback } from 'ioo/dist/Interfaces';
import { IClass, IDescriptor } from '../Interfaces';
import wrapProps from './wrapProps';

export default function mapInstanceProps(
  Class: IClass,
  callback: (descriptor: IDescriptor, name: string) => any,
  attributes = {}
) {
  return wrapProps(Class, callback, attributes);
}
