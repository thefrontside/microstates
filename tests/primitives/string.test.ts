import 'jest';
import microstates from '../../src/microstates';
import { isMicrostateAction } from '../../src/constants';
import MicrostateNumber from '../../src/primitives/number';
import MicrostateString from '../../src/primitives/string';

describe('string', () => {
  describe('as root', () => {
    it('can created without default', () => {
      let { state, actions } = microstates(String);
      expect(state).toBe('');
      expect(actions.concat.isMicrostateAction).toBe(isMicrostateAction);
    });
    it('can be created with default', () => {
      let { state } = microstates(String, true);
      expect(state).toBe(true);
    });
  });

  describe('set action', () => {
    let ms;
    beforeEach(() => {
      ms = microstates(String);
    });
    it('does not throw', () => {
      expect(() => {
        ms.actions.set(null);
        ms.actions.set(0);
        ms.actions.set(new MicrostateNumber(42));
        ms.actions.set(new MicrostateString('hello'));
      }).not.toThrow();
    });
  });
});
