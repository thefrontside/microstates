
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

sugar.extendTypes(function matchObject(value) {
  if (value != null && typeof value === 'object' && Object.keys(value).length < 2) {
    let [ key ] = Object.keys(value);
    return key != null ? ObjectType.of(sugar.desugarType(value[key])) : ObjectType;
  } else {
    return value;
  }
})

sugar.extendTypes(function matchArray(value) {
  if (Array.isArray(value) && value.length < 2) {
    let [ T ] = value;
    return T != null ? ArrayType.of(sugar.desugarType(T)) : ArrayType;
  } else {
    return value;
  }
})
