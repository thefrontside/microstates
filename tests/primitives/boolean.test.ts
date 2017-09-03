import MicrostateString from '../../src/primitives/string';
import MicrostateBoolean from '../../src/primitives/boolean';
import 'jest';
import microstates from '../../src/microstates';

describe('boolean', () => {
  describe('as root', () => {
    describe('without initial', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(Boolean);
      });
      it('can be created without default', () => {
        expect(ms.state).toBe(false);
      });
    });
    describe('with initial', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(Boolean, true);
      });
      it('can be created with a default', () => {
        expect(ms.state).toBe(true);
      });
    });
  });

  describe('set action', () => {
    let ms;
    beforeEach(() => {
      ms = microstates(Boolean);
    });
    it('does not throw', () => {
      expect(() => {
        ms.transitions.set(null);
        ms.transitions.set('');
        ms.transitions.set(new MicrostateString('foo'));
        ms.transitions.set(new MicrostateBoolean(true));
      }).not.toThrow();
    });
  });
});
