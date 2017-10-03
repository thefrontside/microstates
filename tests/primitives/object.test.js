import 'jest';

import Microstates from '../../src';
import transitionsFor from '../../src/utils/transitions-for';

describe('object', () => {
  describe('as root', () => {
    describe('without initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Object);
      });
      it('can be created without default', () => {
        expect(ms.states).toEqual({});
      });
    });
    describe('with initial', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Object, { foo: 'bar' });
      });
      it('can be created with default', () => {
        expect(ms.states).toEqual({ foo: 'bar' });
      });
    });
  });
  describe('transitions', () => {
    let transitions = transitionsFor(Object);
    describe('set', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Object);
      });
      it('is defined', () => {
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
    it('has assign transition', () => {
      expect(transitions.assign).toBeDefined();
    });
  });
});
