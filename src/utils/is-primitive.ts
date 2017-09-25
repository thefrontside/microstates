import { ISchema } from '../Interfaces';
import MicrostateArray from '../primitives/array';
import MicrostateBoolean from '../primitives/boolean';
import MicrostateNumber from '../primitives/number';
import MicrostateObject from '../primitives/object';
import MicrostateString from '../primitives/string';
import getReducerType from './get-reducer-type';

export default function isPrimitive(type: ISchema) {
  switch (getReducerType(type)) {
    case MicrostateString:
    case MicrostateNumber:
    case MicrostateBoolean:
    case MicrostateObject:
    case MicrostateArray:
      return true;
  }
  return false;
}
