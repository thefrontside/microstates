import ArrayType from './array';
import ObjectType from './object';
import NumberType from './number';
import BooleanType from './boolean';
import StringType from './string';

export default function toType(Constructor) {
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
