import ComputedProperty from './ComputedProperty';
import { IDescriptor } from '../Interfaces';

export default function defineComputedProperty(
  object: Object,
  name: string,
  callback: any,
  attributes: IDescriptor
) {
  return Object.defineProperty(object, name, new ComputedProperty(callback, attributes));
}
