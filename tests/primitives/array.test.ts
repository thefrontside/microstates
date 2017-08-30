import 'jest';
import microstates from '../../src/microstates';
import MicrostateString from '../../src/primitives/string';
import MicrostateArray from '../../src/primitives/array';
import { isMicrostateAction } from '../../src/constants';

describe('array', () => {
  describe('primitive', () => {
    describe('root', () => {
      it('can be created without a default', () => {
        let { state, actions } = microstates(Array);
        expect(state).toEqual([]);
        expect(actions.push.isMicrostateAction).toBe(isMicrostateAction);
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
          ms.actions.set(null);
        }).not.toThrow();
      });
      it("throws an exception set doesn't match type", () => {
        expect(() => {
          ms.actions.set('');
        }).toThrowError(/set expected Array, got String/);
        expect(() => {
          ms.actions.set(new MicrostateString('foo'));
        }).toThrowError(/set expected Array, got MicrostateString/);
      });
      it('does not throw on reducer type', () => {
        expect(() => {
          ms.actions.set(MicrostateArray.from(['hello']));
        }).not.toThrow();
      });
    });
  });

  describe('parameterized', () => {
    describe('root', () => {
      class Item {
        name = String;
      }
      let { state, actions } = microstates([Item]);
      let newState = actions.push({ name: 'MacBook' });
      it('allows to push item and returns Item', () => {
        expect(newState[0]).toBeInstanceOf(Item);
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
        let { actions } = microstates(State);
        expect(typeof actions.products.set).toBe('function');
      });
    });
  });
});
