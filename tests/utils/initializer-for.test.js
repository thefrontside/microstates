import 'jest';

import ArrayType from '../../src/types/array';
import BooleanType from '../../src/types/boolean';
import NumberType from '../../src/types/number';
import ObjectType from '../../src/types/object';
import StringType from '../../src/types/string';
import initializerFor from '../../src/utils/initializer-for';

describe('initializer-for', () => {
  it('gets initialize for Number', () => {
    expect(initializerFor(Number)).toBe(NumberType.prototype.initialize);
  });
  it('get initialize for String', () => {
    expect(initializerFor(String)).toBe(StringType.prototype.initialize);
  });
  it('gets initialize for Boolean', () => {
    expect(initializerFor(Boolean)).toBe(BooleanType.prototype.initialize);
  });
  it('gets initialize for Object', () => {
    expect(initializerFor(Object)).toBe(ObjectType.prototype.initialize);
  });
  it('gets initialize for Array', () => {
    expect(initializerFor(Array)).toBe(ArrayType.prototype.initialize);
  });
  describe('custom Type', () => {
    class WithInitialize {
      initialize() {}
    }
    class WithoutInitialize {}
    it('gets initialize for custom type', () => {
      expect(initializerFor(WithInitialize)).toBe(WithInitialize.prototype.initialize);
    });
    it('provides default initialize for custom type', () => {
      expect(initializerFor(WithoutInitialize)).toBeDefined();
    });
  });
});
