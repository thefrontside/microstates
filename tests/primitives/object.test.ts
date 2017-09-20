import 'jest';

import microstates from '../../src/microstates';
import MicrostateObject from '../../src/primitives/object';
import MicrostateString from '../../src/primitives/string';

describe('object', () => {
  describe('as root', () => {
    describe('without initial value', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(Object);
      });
      it('can be created without default', () => {
        expect(ms.state).toEqual({});
      });
    });

    describe('with initial', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(Object, { foo: 'bar' });
      });
      it('can be created with default', () => {
        expect(ms.state).toEqual({ foo: 'bar' });
      });
    });
  });

  describe('set action', () => {
    let ms;
    beforeEach(() => {
      ms = microstates(Object);
    });
    it('does not throw on null', () => {
      expect(() => {
        ms.transitions.set(null);
        ms.transitions.set('');
        ms.transitions.set(new MicrostateString('foo'));
        ms.transitions.set(new MicrostateObject({ foo: 'bar' }));
      }).not.toThrow();
    });
  });
});
