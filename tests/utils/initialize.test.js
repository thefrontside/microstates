import 'jest';

import initialize from '../../src/utils/initialize';

describe('initialize', () => {
  it(`uses types's initializer`, () => {
    expect(initialize({ Type: Number, path: [] })).toBe(0);
  });
  it('uses passed in value', () => {
    expect(initialize({ Type: Number, path: [] }, 3)).toBe(3);
  });
  describe('shallow nested state', () => {
    class State {
      count = Number;
    }
    describe('primitive state', () => {
      it(`initializes nested state`, () => {
        expect(initialize({ Type: Number, path: ['count'] })).toBe(0);
      });
      it('restores nested state', () => {
        expect(initialize({ Type: Number, path: ['count'] }, { count: 3 })).toBe(3);
      });
    });
    describe('composed state', () => {
      it('uses generic initializer', () => {
        expect(initialize({ Type: State, path: [] })).toBeInstanceOf(Object);
      });
      describe('custom initializer', () => {
        let callback;
        beforeEach(() => {
          callback = jest.fn();
          class WithCustom {}
          WithCustom.prototype.initialize = callback;
          initialize({ Type: WithCustom, path: [] }, { hello: 'world' });
        });
        it('custom initializer', () => {
          expect(callback).toBeCalledWith({ hello: 'world' });
        });
      });
    });
  });
});
