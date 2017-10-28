import 'jest';

import isPrimitive from '../../src/utils/is-primitive';
import * as MS from '../../src';

describe('isPrimitive', () => {
  it('returns true for Number', () => {
    expect(isPrimitive(MS.Number)).toBe(true);
  });
  it('returns true for Object', () => {
    expect(isPrimitive(MS.Object)).toBe(true);
  });
  it('returns true for Array', () => {
    expect(isPrimitive(MS.Array)).toBe(true);
  });
  it('returns true for Boolean', () => {
    expect(isPrimitive(MS.Boolean)).toBe(true);
  });
  it('returns true for String', () => {
    expect(isPrimitive(MS.String)).toBe(true);
  });
});
