import 'jest';

import getTypeDescriptors from '../../src/utils/get-type-descriptors';

describe('getTypeDescriptors', () => {
  class Item {
    constructor() {
      this.string = String;
    }
    say() {
      return 'hello';
    }
    get getter() {
      return;
    }
    static set(current, prop, value) {
      return Object.assign({}, current, { [prop]: value });
    }
  }
  let item = new Item();
  let classDescriptors = getTypeDescriptors(Item);
  let instanceDescriptors = getTypeDescriptors(item);
  describe('from class', () => {
    it('returns descriptors for static methods', () => {
      expect(classDescriptors).toEqual({
        set: {
          value: Item.set,
          enumerable: false,
          configurable: true,
          writable: true,
        },
      });
    });
  });
  describe('from instance', () => {
    it('returns descriptors for methods and properties with callable assignment', () => {
      expect(instanceDescriptors).toEqual({
        string: {
          value: String,
          configurable: true,
          enumerable: true,
          writable: true,
        },
      });
    });
  });
});
