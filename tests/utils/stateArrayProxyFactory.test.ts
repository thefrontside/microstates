import 'jest';

import stateArrayProxyFactory from '../../src/utils/stateArrayProxyFactory';

describe('stateArrayProxyFactory', () => {
  let proxy;
  class Item {
    name = String;
    items = [Item];
  }
  describe('shallow', () => {
    beforeEach(() => {
      proxy = stateArrayProxyFactory([Item], [], [{ name: 'foo' }]);
    });
    it('returns an array', () => {
      expect(Array.isArray(proxy)).toBeTruthy();
    });
    it('array has a lenght', () => {
      expect(proxy.length).toBe(1);
    });
    it('does not throw an out of bounds exception', () => {
      expect(() => {
        expect(proxy[1]).toBeUndefined();
      }).not.toThrow();
    });
  });
  describe('deep', () => {
    beforeEach(() => {
      proxy = stateArrayProxyFactory([Item], [], [{ name: 'foo', items: [{ name: 'boo' }] }]);
    });
    it('return an array', () => {
      expect(Array.isArray(proxy[0].items)).toBeTruthy();
    });
    it('returns hydrated object', () => {
      expect(proxy[0].items[0]).toBeInstanceOf(Item);
      expect(proxy[0].items[0]).toEqual({ name: 'boo', items: [] });
    });
  });
});
