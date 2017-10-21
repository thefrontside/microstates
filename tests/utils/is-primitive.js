import 'jest';

import isPrimitive from '../../src/utils/is-primitive';
import { Number, Array, Object, Boolean, String } from '../../src';

describe('isPrimitive', () => {
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
});
