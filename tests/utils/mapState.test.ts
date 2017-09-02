import 'jest';

import mapForState from '../../src/utils/mapState';
import TypeTree from '../../src/utils/TypeTree';

describe('mapForState', () => {
  describe('primitive', () => {
    let callback = jest.fn().mockReturnValue('');
    let node = new TypeTree(String);
    let state = mapForState(node, [], callback);
    it('invoked callback', () => {
      expect(callback.mock.calls).toHaveProperty('length', 1);
    });
    it('passed node to the callback', () => {
      expect(callback.mock.calls[0][0]).toBe(node);
    });
    it('passed undefined to second argument', () => {
      expect(callback.mock.calls[0][1]).toBeUndefined();
    });
    it('returns value', () => {
      expect(state).toBe('');
    });
  });
  describe('composed', () => {
    describe('object', () => {
      let node, callback, state;
      class State {
        count = Number;
      }
      beforeEach(() => {
        callback = jest.fn();
        node = new TypeTree(State);
        state = mapForState(node, [], callback);
        state.count;
      });
      it('invoked callback once', () => {
        expect(callback.mock.calls.length).toBe(1);
      });
    });
  });
});
