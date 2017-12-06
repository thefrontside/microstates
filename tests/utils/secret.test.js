import 'jest';

import { keep, reveal } from '../../src/utils/secret';

describe('utils/secret', () => {
  it('keep accepts value and returns same object', () => {
    let obj = {};
    expect(keep(obj, 42)).toBe(obj);
  });
  it('reveal returns the hidden value', () => {
    let obj = {};
    expect(reveal(keep(obj, 42))).toBe(42);
  });
  describe('storing on Type', () => {
    let Parent;
    let Child;
    beforeEach(() => {
      Parent = class {};
      Child = class extends Parent {};
    });
    it('does not share secret between child and parent', () => {
      keep(Parent, 42);
      expect(reveal(Parent)).toBe(42);
      expect(reveal(Child)).toBeUndefined();
    });
  });
});
