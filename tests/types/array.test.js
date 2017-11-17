import 'jest';

import ArrayType from '../../src/types/array';
import Microstates, * as MS from '../../src';

describe('array', () => {
  describe('replace', () => {
    let array = ['a', 'b', 'c'];
    let ms = Microstates(MS.Array, array);
    it('replaces first element', () => {
      expect(ms.replace('a', 'd').valueOf()).toEqual(['d', 'b', 'c']);
    });
    it('does not throw when replacing non-existing item', () => {
      expect(() => {
        ms.replace('e', 'd');
      }).not.toThrow();
    });
    it('returns same array when value not found', () => {
      expect(ms.replace('e', 'd').valueOf()).toBe(array);
    });
  });
});
