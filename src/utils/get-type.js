import ArrayType from '../types/array';
import BooleanType from '../types/boolean';
import NumberType from '../types/number';
import ObjectType from '../types/object';
import StringType from '../types/string';

export default function getType(type) {
  switch (type) {
    case String:
      return StringType;
    case Number:
      return NumberType;
    case Boolean:
      return BooleanType;
    case Object:
      return ObjectType;
    case Array:
      return ArrayType;
  }
  return type;
}
