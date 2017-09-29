import 'jest';

import Microstates from '../../src';
import transitionsFor from '../../src/utils/transitions-for';

describe('number', () => {
  describe('as root', () => {
    let ms;
    describe('without initial', () => {
      beforeEach(() => {
        ms = Microstates.from(Number);
      });
      it('can be created without default', () => {
        expect(ms.states).toBe(0);
      });
    });
    describe('with initial', () => {
      beforeEach(() => {
        ms = Microstates.from(Number, 42);
      });
      it('can be created with default', () => {
        expect(ms.states).toBe(42);
      });
    });
  });
  describe('transitions', () => {
    let transitions = transitionsFor(Number);
    describe('set', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Number);
      });
      it('is defined', () => {
        expect(transitions.set).toBeDefined();
      });
      it('does not throw', () => {
        expect(() => {
          ms.transitions.set(null);
          ms.transitions.set('');
        }).not.toThrow();
      });
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has number transitions', () => {
      expect(transitions.sum).toBeDefined();
      expect(transitions.subtract).toBeDefined();
      expect(transitions.increment).toBeDefined();
      expect(transitions.decrement).toBeDefined();
    });
  });
});
