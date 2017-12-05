import 'jest';

import isPrimitive from '../../src/utils/is-primitive';
import * as MS from '../../src';

describe('utils/is-primitive', () => {
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
  it('returns false for a composed object', () => {
    expect(
      isPrimitive(
        class {
          foo = MS.String;
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
