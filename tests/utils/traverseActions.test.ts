import MicrostateArray from '../../src/primitives/array';
import 'jest';

import traverseActions from '../../src/utils/traverseActions';

describe('actions', () => {
  class State {
    string = String;
    number = Number;
    boolean = Boolean;
    array = Array;
    object = Object;
  }

  let actions;
  let onChange;

  beforeEach(() => {
    onChange = jest.fn();
    actions = traverseActions(State, [], onChange);
  });

  describe('string', () => {
    it('is an object', () => {
      expect(actions.string).toBeInstanceOf(Object);
    });
    it('has concat', () => {
      expect(typeof actions.string.concat).toEqual('function');
    });
  });

  describe('number', () => {
    it('is an object', () => {
      expect(actions.number).toBeInstanceOf(Object);
    });
    it('has increment', () => {
      expect(typeof actions.number.increment).toEqual('function');
    });
    it('has decrement', () => {
      expect(typeof actions.number.decrement).toEqual('function');
    });
    it('has sum', () => {
      expect(typeof actions.number.sum).toEqual('function');
    });
    it('has subtract', () => {
      expect(typeof actions.number.subtract).toEqual('function');
    });
  });

  describe('boolean', () => {
    it('is an object', () => {
      expect(actions.boolean).toBeInstanceOf(Object);
    });
    it('has toggle', () => {
      expect(typeof actions.boolean.toggle).toEqual('function');
    });
  });

  describe('object', () => {
    it('is an object', () => {
      expect(actions.object).toBeInstanceOf(Object);
    });
    it('has assign', () => {
      expect(typeof actions.object.assign).toEqual('function');
    });
  });

  describe('array', () => {
    it('is an array', () => {
      expect(actions.array).toBeInstanceOf(Object);
    });
    it('has push', () => {
      expect(typeof actions.array.push).toEqual('function');
    });
  });

  describe('array composition', () => {
    let actions, onChange;
    beforeEach(() => {
      class Product {
        title = String;
      }

      onChange = jest.fn();

      actions = traverseActions(
        class {
          products = [Product];
        },
        [],
        onChange
      );

      actions.products.push({ title: 'iPhone' });
    });

    it('has products actions', () => {
      expect(typeof actions.products).toEqual('object');
    });
    it('has push on products', () => {
      expect(actions.products.push).toBeTruthy();
    });
    it('calls onChange', () => {
      expect(onChange.mock.calls.length).toBe(1);
    });
    it('onChange receives action and arguments', () => {
      expect(onChange.mock.calls[0]).toEqual([
        MicrostateArray.push,
        ['products'],
        [{ title: 'iPhone' }],
      ]);
    });
  });
});
