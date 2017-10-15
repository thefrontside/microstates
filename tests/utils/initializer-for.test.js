import 'jest';

import ArrayState from '../../src/primitives/array';
import BooleanState from '../../src/primitives/boolean';
import NumberState from '../../src/primitives/number';
import ObjectState from '../../src/primitives/object';
import StringState from '../../src/primitives/string';
import initializerFor from '../../src/utils/initializer-for';

describe('initializer-for', () => {
  it('gets initialize for Number', () => {
    expect(initializerFor(Number)).toBe(NumberState.prototype.initialize);
  });
  it('get initialize for String', () => {
    expect(initializerFor(String)).toBe(StringState.prototype.initialize);
  });
  it('gets initialize for Boolean', () => {
    expect(initializerFor(Boolean)).toBe(BooleanState.prototype.initialize);
  });
  it('gets initialize for Object', () => {
    expect(initializerFor(Object)).toBe(ObjectState.prototype.initialize);
  });
  it('gets initialize for Array', () => {
    expect(initializerFor(Array)).toBe(ArrayState.prototype.initialize);
  });
  describe('custom state', () => {
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
