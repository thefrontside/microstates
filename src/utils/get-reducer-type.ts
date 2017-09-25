import { ISchema } from '../Interfaces';
import MicrostateArray from '../primitives/array';
import MicrostateBoolean from '../primitives/boolean';
import MicrostateNumber from '../primitives/number';
import MicrostateObject from '../primitives/object';
import MicrostateString from '../primitives/string';

export default function getReducerType(type: ISchema) {
  switch (type) {
    case String:
      return MicrostateString;
    case Number:
      return MicrostateNumber;
    case Boolean:
      return MicrostateBoolean;
    case Object:
      return MicrostateObject;
    case Array:
      return MicrostateArray;
  }
  return type;
}
