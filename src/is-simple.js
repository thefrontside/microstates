import StringType from './types/string';
import BooleanType from './types/boolean';
import NumberType from './types/number';
import ObjectType from './types/object';
import ArrayType from './types/array';

import getType from './utils/get-type';
import { params } from './type-parameters';

export default function isSimple(Constructor) {
  let Type = getType(Constructor);
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
    let { T } = params(ArrayType);
    return !T;
  }
  return false;
}
