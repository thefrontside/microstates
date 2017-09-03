import 'jest';
import microstates from '../../src/microstates';
import MicrostateString from '../../src/primitives/string';
import MicrostateArray from '../../src/primitives/array';

describe('array', () => {
  describe('primitive', () => {
    describe('root', () => {
      it('can be created without a default', () => {
        let { state, transitions } = microstates(Array);
        expect(state).toEqual([]);
      });
      it('can created with a default', () => {
        let { state } = microstates(Array, ['foo']);
        expect(state).toEqual(['foo']);
      });
    });

    describe('set action', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(Array);
      });
      it('does not throw on null', () => {
        expect(() => {
          ms.transitions.set(null);
          ms.transitions.set('');
          ms.transitions.set(new MicrostateString('foo'));
          ms.transitions.set(MicrostateArray.from(['hello']));
        }).not.toThrow();
      });
    });
  });

  describe('parameterized', () => {
    describe('root', () => {
      let ms, newState;
      class Item {
        name = String;
      }
      beforeEach(() => {
        ms = microstates([Item]);
        newState = ms.transitions.push({ name: 'MacBook' });
      });
      it('added one item', () => {
        expect(newState.length).toEqual(1);
      });
      it('evaluates to object of parameter type', () => {
        expect(newState[0]).toBeInstanceOf(Item);
      });
      it('value can be retrieved', () => {
        expect(newState[0]).toEqual({ name: 'MacBook' });
      });
    });
    describe('set', () => {
      it('has set', () => {
        class Item {
          name = String;
        }
        class State {
          products = [Item];
        }
        let { transitions } = microstates(State);
        expect(typeof transitions.products.set).toBe('function');
      });
    });
  });
});
