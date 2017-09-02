import 'jest';

import traverseState from '../../src/utils/traverseState';
import TypeTree from '../../src/utils/TypeTree';

describe('traverseState', () => {
  class State {
    string = String;
    number = Number;
    boolean = Boolean;
    array = Array;
    object = Object;
  }
  let tree = new TypeTree(State);

  describe('state', () => {
    describe('root', () => {
      let state;
      beforeEach(() => {
        state = traverseState(tree, [], {});
      });
      it('is instance of State', () => {
        expect(state).toBeInstanceOf(State);
      });
    });

    describe('string', () => {
      let state;
      beforeEach(() => {
        state = traverseState(tree, [], {});
      });
      it('is a string', () => {
        expect(typeof state.string).toEqual('string');
      });

      it('is empty', () => {
        expect(state.string).toBe('');
      });
    });

    describe('number', () => {
      let state;
      beforeEach(() => {
        state = traverseState(tree, [], {});
      });
      it('is a number', () => {
        expect(typeof state.number).toEqual('number');
      });

      it('is zero', () => {
        expect(state.number).toBe(0);
      });
    });

    describe('boolean', () => {
      let state;
      beforeEach(() => {
        state = traverseState(tree, [], {});
      });
      it('is a boolean', () => {
        expect(typeof state.boolean).toEqual('boolean');
      });

      it('is false', () => {
        expect(state.boolean).toBe(false);
      });
    });

    describe('array', () => {
      let state;
      beforeEach(() => {
        state = traverseState(tree, [], {});
      });

      it('is a array', () => {
        expect(Array.isArray(state.array)).toBeTruthy();
      });

      it('is empty', () => {
        expect(state.array).toEqual([]);
      });
    });

    describe('parameterized array', () => {
      let state;
      class Product {
        title = String;
      }
      class State {
        products = [Product];
      }

      let tree = new TypeTree(State);
      beforeEach(() => {
        state = traverseState(tree, [], { products: [{ title: 'MacBook' }] });
      });

      it('returns a Product', () => {
        expect(state.products[0]).toBeInstanceOf(Product);
      });

      it('returned product has value', () => {
        expect(state).toHaveProperty('products.0.title', 'MacBook');
      });
    });

    describe('object', () => {
      let state;
      beforeEach(() => {
        state = traverseState(tree, [], {});
      });
      it('is a object', () => {
        expect(typeof state.object).toEqual('object');
      });

      it('is empty', () => {
        expect(state.object).toEqual({});
      });
    });
  });
});
