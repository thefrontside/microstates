import 'jest';

import microstates from '../../src/microstates';
import { isMicrostateAction } from '../../src/constants';
import MicrostateString from '../../src/primitives/string';
import MicrostateNumber from '../../src/primitives/number';

describe('number', () => {
  describe('as root', () => {
    it('can be created without default', () => {
      let { state, actions } = microstates(Number);
      expect(state).toBe(0);
      expect(actions.sum.isMicrostateAction).toBe(isMicrostateAction);
    });
    it('can be created with default', () => {
      let { state } = microstates(Number, 42);
      expect(state).toBe(42);
    });
  });

  describe('set action', () => {
    let ms;
    beforeEach(() => {
      ms = microstates(Number);
    });
    it('does not throw on null', () => {
      expect(() => {
        ms.actions.set(null);
      }).not.toThrow();
    });
    it("throws an exception set doesn't match type", () => {
      expect(() => {
        ms.actions.set('');
      }).toThrowError(/set expected Number, got String/);
      expect(() => {
        ms.actions.set(new MicrostateString('foo'));
      }).toThrowError(/set expected Number, got MicrostateString/);
    });
    it('does not throw on reducer type', () => {
      expect(() => {
        ms.actions.set(new MicrostateNumber('hello'));
      }).not.toThrow();
    });
  });
});
