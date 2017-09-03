import 'jest';
import microstates from '../../src/microstates';
import MicrostateNumber from '../../src/primitives/number';
import MicrostateString from '../../src/primitives/string';

describe('string', () => {
  describe('as root', () => {
    describe('without initial', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(String);
      });
      it('can created without default', () => {
        expect(ms.state).toBe('');
      });
    });
    describe('with initial', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(String, true);
      });
      it('can be created with default', () => {
        expect(ms.state).toBe(true);
      });
    });
  });

  describe('set action', () => {
    let ms;
    beforeEach(() => {
      ms = microstates(String);
    });
    it('does not throw', () => {
      expect(() => {
        ms.transitions.set(null);
        ms.transitions.set(0);
        ms.transitions.set(new MicrostateNumber(42));
        ms.transitions.set(new MicrostateString('hello'));
      }).not.toThrow();
    });
  });
});
