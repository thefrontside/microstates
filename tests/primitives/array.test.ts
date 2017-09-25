import 'jest';

import microstates from '../../src/microstates';
import MicrostateString from '../../src/primitives/string';

describe('array', () => {
  describe('primitive', () => {
    describe('root', () => {
      it('can be created without a default', () => {
        let { state, transitions } = microstates(Array);
        expect(state).toEqual([]);
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
          ms.transitions.set(null);
          ms.transitions.set('');
          ms.transitions.set(new MicrostateString('foo'));
        }).not.toThrow();
      });
    });
  });
});
