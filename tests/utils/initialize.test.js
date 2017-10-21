import 'jest';

import { append } from 'funcadelic';
import initialize from '../../src/utils/initialize';

describe('initialize', () => {
  describe('Number', () => {
    it(`uses types's initializer`, () => {
      expect(initialize({ Type: Number, path: [] })).toBe(0);
    });
    it('uses passed in value', () => {
      expect(initialize({ Type: Number, path: [] }, 3)).toBe(3);
    });
  });
  describe('Array', () => {
    it(`uses types's initializer`, () => {
      expect(initialize({ Type: Array, path: [] })).toEqual([]);
    });
    it('uses passed in value', () => {
      expect(initialize({ Type: Array, path: [] }, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });
  describe('Boolean', () => {
    it(`uses types's initializer`, () => {
      expect(initialize({ Type: Boolean, path: [] })).toBe(false);
    });
    it('uses passed in value', () => {
      expect(initialize({ Type: Boolean, path: [] }, true)).toBe(true);
    });
  });
  describe('Object', () => {
    it(`uses types's initializer`, () => {
      expect(initialize({ Type: Object, path: [] })).toEqual({});
    });
    it('uses passed in value', () => {
      expect(initialize({ Type: Object, path: [] }, { hello: 'world' })).toEqual({
        hello: 'world',
      });
    });
  });
  describe('String', () => {
    it(`uses types's initializer`, () => {
      expect(initialize({ Type: String, path: [] })).toBe('');
    });
    it('uses passed in value', () => {
      expect(initialize({ Type: String, path: [] }, 'hello world')).toBe('hello world');
    });
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
        let result;
        beforeEach(() => {
          class WithCustom {
            constructor(attrs) {
              return append(this, attrs);
            }
          }
          result = initialize({ Type: WithCustom, path: [] }, { hello: 'world' });
        });
        it('initialized', () => {
          expect(result).toEqual({ hello: 'world' });
        });
      });
    });
  });
});
