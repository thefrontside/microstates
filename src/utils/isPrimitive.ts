import { ISchema } from '../Interfaces';
import getReducerType from './getReducerType';
import MicrostateString from '../primitives/string';
import MicrostateNumber from '../primitives/number';
import MicrostateBoolean from '../primitives/boolean';
import MicrostateObject from '../primitives/object';
import MicrostateArray from '../primitives/array';

export default function isPrimitive(type: ISchema) {
  if (Array.isArray(type) && type.length > 0) {
    return false;
  }
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
