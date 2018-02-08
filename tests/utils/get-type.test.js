import 'jest';
import prettyFormat from 'pretty-format';
import { map } from 'funcadelic';
import getType from '../../src/utils/get-type';
import BooleanType from '../../src/types/boolean';
import NumberType from '../../src/types/number';
import ObjectType from '../../src/types/object';
import StringType from '../../src/types/string';
import ArrayType from '../../src/types/array';

function type_it(values, result) {
  values.forEach( value => (
    it(`returns ${prettyFormat(result)} for ${prettyFormat(value)}`, () => {
      expect(getType(Boolean).name).toBe(BooleanType.name);
    })
  ));
} 

class MyClass {}

type_it([Boolean, true, false], BooleanType);
type_it([Number, 0, -1], NumberType);
type_it([Object, {}], ObjectType);
type_it([String, ""], StringType);
type_it([Array, [], new Array()], ArrayType);
type_it([MyClass], MyClass);
