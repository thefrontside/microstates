import { IDescriptor } from '../Interfaces';
import ComputedProperty from './computed-property';

export default function defineComputedProperty(
  object: Object,
  name: string,
  callback: any,
  attributes: IDescriptor
) {
  return Object.defineProperty(object, name, new ComputedProperty(callback, attributes));
}
