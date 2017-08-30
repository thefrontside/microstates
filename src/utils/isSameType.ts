import { ISchema } from '../Interfaces';
import getReducerType from './getReducerType';

export default function isSameType(A: ISchema, B: ISchema) {
  return A === B || getReducerType(A) === getReducerType(B);
}
