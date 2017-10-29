import 'jest';

import withoutGetters from '../../src/utils/without-getters';

describe('withoutGetters', () => {
  it('returns value on simple objects', () => {
    expect(withoutGetters(1)).toBe(1);
  });
  it('returns only values on shallow objects', () => {
    expect(
      withoutGetters({
        a: 'a',
        get b() {
          return 'b';
        },
      })
    ).toEqual({ a: 'a' });
  });
  it('returns only values on nested objects', () => {
    expect(
      withoutGetters({
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
