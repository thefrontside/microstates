import StringType from './types/string';
import NumberType from './types/number';
import BooleanType from './types/boolean';
import ArrayType from './types/array';
import ObjectType from './types/object';

export default {
  String: StringType,
  Number: NumberType,
  Boolean: BooleanType,
  Array: ArrayType,
  Object: ObjectType
};

export function toType(Constructor) {
  switch (Constructor) {
  case Array:
    return ArrayType;
  case Object:
    return ObjectType;
  case Number:
    return NumberType;
  case String:
    return StringType;
  case Boolean:
    return BooleanType;
  default:
    return Constructor;
  }
}

export { parameterized, params, any } from './types/parameters';
