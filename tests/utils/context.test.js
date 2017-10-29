import 'jest';

import ContextFactory from '../../src/utils/context';
import * as MS from '../../src';

describe('context', () => {
  class State {
    count = MS.Number;
  }
  let context = ContextFactory(State);
  describe('intermiate state reset', () => {
    it('reinitializes the value', () => {
      expect(
        context({})
          .count.increment()
          .set(null)
          .count.increment(5)
          .valueOf()
      ).toEqual({
        count: 5,
      });
    });
  });
  describe('without value', () => {
    let result = context();
    it('returns transitions', () => {
      expect(result).toMatchObject({
        count: {
          increment: expect.any(Function),
          decrement: expect.any(Function),
        },
      });
    });
    describe('valueOf', () => {
      it('is present', () => {
        expect(result).toHaveProperty('valueOf');
      });
      it('returns undefined', () => {
        expect(result.valueOf()).toBeUndefined();
      });
      it('is present after transition', () => {
        expect(result.count.increment()).toHaveProperty('valueOf');
      });
      it('returns new value after transition', () => {
        expect(result.count.increment().valueOf()).toEqual({ count: 1 });
      });
    });
  });
  describe('with value', () => {
    let result = context({ count: 5 });
    it('returns transitions', () => {
      expect(result).toMatchObject({
        count: {
          increment: expect.any(Function),
          decrement: expect.any(Function),
        },
      });
    });
    describe('valueOf', () => {
      it('is present', () => {
        expect(result).toHaveProperty('valueOf');
      });
      it('returns passed in value', () => {
        expect(result.valueOf()).toEqual({ count: 5 });
      });
      it('is present after transition', () => {
        expect(result.count.increment()).toHaveProperty('valueOf');
      });
      it('returns new value after transition', () => {
        expect(result.count.increment().valueOf()).toEqual({ count: 6 });
      });
    });
  });
});
