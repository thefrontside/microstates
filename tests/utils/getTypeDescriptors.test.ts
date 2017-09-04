import 'jest';

import getTypeDescriptors from '../../src/utils/getTypeDescriptors';

describe('getTypeDescriptors', () => {
  const ArrayOfStrings = [String];
  class Item {
    string = String;
    array = ArrayOfStrings;
    say() {
      return 'hello';
    }
    get getter() {
      return;
    }
    static set(current, prop, value) {
      return {
        ...current,
        [prop]: value,
      };
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
        array: {
          value: ArrayOfStrings,
          configurable: true,
          enumerable: true,
          writable: true,
        },
      });
    });
  });
});
