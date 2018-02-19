import StringType from './types/string';
import BooleanType from './types/boolean';
import NumberType from './types/number';
import ObjectType from './types/object';
import ArrayType from './types/array';

import toType from './types/to-type';
import { params, any } from './types/parameters';

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
    if (T === any) {
      return true;
    } else {
      return isSimple(T);
    }
  }
  if (Type === any) {
    return true;
  }
  return false;
}
