import { ISchema } from '../Interfaces';
import MicrostateArray from '../primitives/array';
import getReducerType from './get-reducer-type';

export default function isList(Type: ISchema) {
  return getReducerType(Type) === MicrostateArray;
}
