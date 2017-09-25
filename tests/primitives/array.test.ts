import 'jest';

import Microstates from '../../src/microstates';
import transitionsFor from '../../src/utils/transitions-for';

describe('array', () => {
  describe('primitive', () => {
    describe('root', () => {
      it('can be created without a default', () => {
        let { states, transitions } = Microstates.from(Array);
        expect(states).toEqual([]);
      });
      it('can created with a default', () => {
        let { states } = Microstates.from(Array, ['foo']);
        expect(states).toEqual(['foo']);
      });
    });

    describe('transitions', () => {
      let transitions = transitionsFor(Array);
      describe('set', () => {
        let ms;
        beforeEach(() => {
          ms = Microstates.from(Array);
        });
        it('is present', () => {
          expect(transitions.set).toBeDefined();
        });
        it('does not throw on null', () => {
          expect(() => {
            ms.transitions.set(null);
            ms.transitions.set('');
          }).not.toThrow();
        });
      });
      it('has initialize transition', () => {
        expect(transitions.initialize).toBeDefined();
      });
      it('has push transition', () => {
        expect(transitions.push).toBeDefined();
      });
    });
  });
});
