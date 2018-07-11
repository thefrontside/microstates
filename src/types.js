import { TypeDelegate } from './type-delegate';

import ObjectType from './types/object';
import ArrayType from './types/array';
import BooleanType from './types/boolean';
import NumberType from './types/number';
import StringType from './types/string';

export { ObjectType, ArrayType, BooleanType, NumberType, StringType };


TypeDelegate.instance(Boolean, {
  typeDelegateFor: () => BooleanType
})

TypeDelegate.instance(Number, {
  typeDelegateFor: () => NumberType
})

TypeDelegate.instance(String, {
  typeDelegateFor: () => StringType
})
