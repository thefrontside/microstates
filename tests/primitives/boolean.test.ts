import 'jest';

import Microstates from '../../src/microstates';
import transitionsFor from '../../src/utils/transitions-for';

describe('boolean', () => {
  describe('as root', () => {
    describe('without initial', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Boolean);
      });
      it('can be created without default', () => {
        expect(ms.states).toBe(false);
      });
    });
    describe('with initial', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Boolean, true);
      });
      it('can be created with a default', () => {
        expect(ms.states).toBe(true);
      });
    });
  });

  describe('transitions', () => {
    let transitions = transitionsFor(Boolean);
    describe('set', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Boolean);
      });
      it('is defined', () => {
        expect(transitions.set).toBeDefined();
      });
      it('does not throw', () => {
        expect(() => {
          ms.transitions.set(null);
          ms.transitions.set(true);
        }).not.toThrow();
      });
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has toggle transition', () => {
      expect(transitions.toggle).toBeDefined();
    });
  });
});
