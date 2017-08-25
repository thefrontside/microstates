import 'jest';

import getCallableDescriptors from './getCallableDescriptors';

describe('getCallableDescriptors', () => {
  class Item {
    string = String;
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
  let classDescriptors = getCallableDescriptors(Item);
  let instanceDescriptors = getCallableDescriptors(item);
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
