import StringType from './types/string';
import BooleanType from './types/boolean';
import NumberType from './types/number';
import ObjectType from './types/object';
import ArrayType from './types/array';
import Any from './types/any';

import { toType } from './types';
import { params } from './types/parameters';

export default function isSimple(Constructor) {
  let Type = toType(Constructor);
  if (Type === BooleanType) {
    return true;
  }
  if (Type === NumberType) {
    return true;
  }
  if (Type === StringType) {
    return true;
  }
  if (Type === ArrayType || Type.prototype instanceof ArrayType) {
    let { T } = params(Type);
    return isSimple(T);
  }
  if (Type === ObjectType || Type.prototype instanceof ObjectType) {
    let { T } = params(Type);
    if (T === Any) {
      return true;
    } else {
      return isSimple(T);
    }
  }
  if (Type === Any) {
    return true;
  }
  return false;
}
