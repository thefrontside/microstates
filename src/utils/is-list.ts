import { ISchema } from '../Interfaces';
import MicrostateArray from '../primitives/array';
import getReducerType from './getReducerType';

export default function isList(Type: ISchema) {
  return getReducerType(Type) === MicrostateArray;
}
