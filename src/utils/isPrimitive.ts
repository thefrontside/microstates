import { IClass } from '../Interfaces';
import getReducerType from './getReducerType';

export default function isPrimitive(constructor: IClass) {
  return getReducerType(constructor) !== constructor;
}
