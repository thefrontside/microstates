import 'jest';

import valueOf from '../../src/utils/value-of';

describe('valueOf', () => {
  it('returns value on simple objects', () => {
    expect(valueOf(1)).toBe(1);
  });
  it('returns only values on shallow objects', () => {
    expect(
      valueOf({
        a: 'a',
        get b() {
          return 'b';
        },
      })
    ).toEqual({ a: 'a' });
  });
  it('returns only values on nested objects', () => {
    expect(
      valueOf({
        a: 'a',
        get b() {
          return 'b';
        },
        c: {
          d: 'd',
          get e() {
            return 'e';
          },
        },
      })
    ).toEqual({
      a: 'a',
      c: {
        d: 'd',
      },
    });
  });
});
