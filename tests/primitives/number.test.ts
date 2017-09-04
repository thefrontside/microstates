import 'jest';

import microstates from '../../src/microstates';
import MicrostateString from '../../src/primitives/string';
import MicrostateNumber from '../../src/primitives/number';

describe('number', () => {
  describe('as root', () => {
    let ms;
    describe('without initial', () => {
      beforeEach(() => {
        ms = microstates(Number);
      });
      it('can be created without default', () => {
        expect(ms.state).toBe(0);
      });
    });
    describe('with initial', () => {
      beforeEach(() => {
        ms = microstates(Number, 42);
      });
      it('can be created with default', () => {
        expect(ms.state).toBe(42);
      });
    });
  });

  describe('set action', () => {
    let ms;
    beforeEach(() => {
      ms = microstates(Number);
    });
    it('does not throw', () => {
      expect(() => {
        ms.transitions.set(null);
        ms.transitions.set('');
        ms.transitions.set(new MicrostateNumber('hello'));
        ms.transitions.set(new MicrostateString('foo'));
      }).not.toThrow();
    });
  });
});
