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
    it('does not throw', () => {
      expect(() => {
        ms.actions.set(null);
        ms.actions.set('');
        ms.actions.set(new MicrostateString('foo'));
        ms.actions.set(new MicrostateBoolean(true));
      }).not.toThrow();
    });
  });
});
