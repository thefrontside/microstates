import 'jest';

import mapForState from '../../src/utils/mapState';
import TypeTree from '../../src/utils/TypeTree';

describe('mapState', () => {
  describe('primitive', () => {
    describe('string', () => {
      let callback = jest.fn().mockReturnValue('foo');
      let node = new TypeTree(String);
      let state = mapForState(node, [], callback);
      it('invoked callback', () => {
        expect(callback.mock.calls).toHaveProperty('length', 1);
      });
      it('passed lens to first argument', () => {
        expect(callback.mock.calls[0][0]).toBeInstanceOf(Function);
      });
      it('returns value', () => {
        expect(state).toBe('foo');
      });
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
