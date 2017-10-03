import MicrostateArray from '../primitives/array';
import getReducerType from './get-reducer-type';

export default function isList(Type) {
  return getReducerType(Type) === MicrostateArray;
}
