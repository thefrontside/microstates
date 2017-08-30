import { ISchema } from '../Interfaces';
import getReducerType from './getReducerType';

export default function isPrimitive(constructor: ISchema) {
  return getReducerType(constructor) !== constructor;
}
