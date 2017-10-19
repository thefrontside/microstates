import 'jest';

import ArrayType from '../../src/types/array';
import BooleanType from '../../src/types/boolean';
import NumberType from '../../src/types/number';
import ObjectType from '../../src/types/object';
import StringType from '../../src/types/string';
import getType from '../../src/utils/get-type';

describe('getType', () => {
  it('returns StringType for String', () => {
    expect(getType(String)).toBe(StringType);
  });
  it('returns BooleanType for Boolean', () => {
    expect(getType(Boolean)).toBe(BooleanType);
  });
  it('returns NumberType for Number', () => {
    expect(getType(Number)).toBe(NumberType);
  });
  it('returns ObjectType for Object', () => {
    expect(getType(Object)).toBe(ObjectType);
  });
  it('returns ArrayType for Boolean', () => {
    expect(getType(Array)).toBe(ArrayType);
  });
});
