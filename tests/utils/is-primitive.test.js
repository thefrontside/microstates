import 'jest';

import isPrimitive from '../../src/utils/is-primitive';

describe('utils/is-primitive', () => {
  it('returns true for Number', () => {
    expect(isPrimitive(Number)).toBe(true);
  });
  it('returns true for Object', () => {
    expect(isPrimitive(Object)).toBe(true);
  });
  it('returns true for Array', () => {
    expect(isPrimitive(Array)).toBe(true);
  });
  it('returns true for Boolean', () => {
    expect(isPrimitive(Boolean)).toBe(true);
  });
  it('returns true for String', () => {
    expect(isPrimitive(String)).toBe(true);
  });
  it('returns false for a composed object', () => {
    expect(
      isPrimitive(
        class {
          foo = String;
        }
      )
    ).toBe(false);
  });
  it('returns false for object with a constant', () => {
    expect(
      isPrimitive(
        class {
          foo = 'bar';
        }
      )
    ).toBe(false);
  });
});
