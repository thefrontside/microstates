import MicrostateString from '../../src/primitives/string';
import MicrostateBoolean from '../../src/primitives/boolean';
import 'jest';
import microstates from '../../src/microstates';
import { isMicrostateAction } from '../../src/constants';

describe('boolean', () => {
  describe('as root', () => {
    it('can be created without default', () => {
      let { state, actions } = microstates(Boolean);
      expect(state).toBe(false);
      expect(actions.toggle.isMicrostateAction).toBe(isMicrostateAction);
    });
    it('can be created with a default', () => {
      let { state } = microstates(Boolean, true);
      expect(state).toBe(true);
    });
  });

  describe('set action', () => {
    let ms;
    beforeEach(() => {
      ms = microstates(Boolean);
    });
    it('does not throw on null', () => {
      expect(() => {
        ms.actions.set(null);
      }).not.toThrow();
    });
    it("throws an exception set doesn't match type", () => {
      expect(() => {
        ms.actions.set('');
      }).toThrowError(/set expected Boolean, got String/);
      expect(() => {
        ms.actions.set(new MicrostateString('foo'));
      }).toThrowError(/set expected Boolean, got MicrostateString/);
    });
    it('does not throw on reducer type', () => {
      expect(() => {
        ms.actions.set(new MicrostateBoolean(true));
      }).not.toThrow();
    });
  });
});
