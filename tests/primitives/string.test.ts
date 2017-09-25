import 'jest';

import Microstates from '../../src/microstates';
import transitionsFor from '../../src/utils/transitions-for';

describe('string', () => {
  describe('as root', () => {
    describe('without initial', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(String);
      });
      it('can created without default', () => {
        expect(ms.states).toBe('');
      });
    });
    describe('with initial', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(String, true);
      });
      it('can be created with default', () => {
        expect(ms.states).toBe(true);
      });
    });
  });
  describe('string', () => {
    let transitions = transitionsFor(String);
    describe('set', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(String);
      });
      it('is defined', () => {
        expect(transitions.set).toBeDefined();
      });
      it('does not throw', () => {
        expect(() => {
          ms.transitions.set(null);
          ms.transitions.set(0);
        }).not.toThrow();
      });
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has string transitions', () => {
      expect(transitions.concat).toBeDefined();
    });
  });
});
