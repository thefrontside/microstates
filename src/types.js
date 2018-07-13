
import ObjectType from './types/object';
import ArrayType from './types/array';
import BooleanType from './types/boolean';
import NumberType from './types/number';
import StringType from './types/string';

export { ObjectType, ArrayType, BooleanType, NumberType, StringType };

import sugar from './sugar';
sugar.mapType(Object, ObjectType)
sugar.mapType(Array, ArrayType)
sugar.mapType(Boolean, BooleanType)
sugar.mapType(Number, NumberType)
sugar.mapType(String, StringType)

sugar.extendTypes(function matchArray(value) {
  if (Array.isArray(value) && value.length < 2) {
    if (value.length === 0) {
      return ArrayType;
    } else {
      let [ T ] = value;
      return ArrayType.of(T);
    }
  } else {
    return value;
  }
})
