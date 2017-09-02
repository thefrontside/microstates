import MicrostateString from '../../src/primitives/string';
import MicrostateBoolean from '../../src/primitives/boolean';
import 'jest';
import microstates from '../../src/microstates';

describe('boolean', () => {
  describe('as root', () => {
    it('can be created without default', () => {
      let ms = microstates(Boolean, true);
      expect(ms.state).toBe(false);
    });
    it('can be created with a default', () => {
      let ms = microstates(Boolean, true);
      console.log(ms);
      expect(ms.state).toBe(true);
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
