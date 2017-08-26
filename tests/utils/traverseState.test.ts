import 'jest';

import traverseState from '../../src/utils/traverseState';

describe('traverseState', () => {
  class State {
    string = String;
    number = Number;
    boolean = Boolean;
    array = Array;
    object = Object;
  }

  let state;
  beforeEach(() => {
    state = traverseState(State, [], {});
  });

  describe('state', () => {
    describe('string', () => {
      it('is a string', () => {
        expect(typeof state.string).toEqual('string');
      });

      it('is empty', () => {
        expect(state.string).toBe('');
      });
    });

    describe('number', () => {
      it('is a number', () => {
        expect(typeof state.number).toEqual('number');
      });

      it('is zero', () => {
        expect(state.number).toBe(0);
      });
    });

    describe('boolean', () => {
      it('is a boolean', () => {
        expect(typeof state.boolean).toEqual('boolean');
      });

      it('is false', () => {
        expect(state.boolean).toBe(false);
      });
    });

    describe('array', () => {
      it('is a array', () => {
        expect(Array.isArray(state.array)).toBeTruthy();
      });

      it('is empty', () => {
        expect(state.array).toEqual([]);
      });

      describe('array composition', () => {
        class Product {
          title = String;
        }

        let traverseProducts = traverseState(
          class {
            products = [Product];
          },
          []
        );

        it('deserializes a single object', () => {
          let { products } = traverseProducts({ products: [{ title: 'MacBook' }] });
          expect(products[0]).toBeInstanceOf(Product);
          expect(products[0]).toEqual({ title: 'MacBook' });
        });
      });
    });

    describe('object', () => {
      it('is a object', () => {
        expect(typeof state.object).toEqual('object');
      });

      it('is empty', () => {
        expect(state.object).toEqual({});
      });
    });
  });
});
