import MicrostateString from '../../src/primitives/string';
import MicrostateArray from '../../src/primitives/array';
import 'jest';
import microstates from '../../src/microstates';
import { isMicrostateAction } from '../../src/constants';

describe('array', () => {
  describe('as root', () => {
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
