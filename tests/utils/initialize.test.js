import 'jest';

import { append } from 'funcadelic';
import initialize from '../../src/utils/initialize';
import * as MS from '../../src';

describe('utils/initialize', () => {
  describe('Number', () => {
    it(`uses types's initializer`, () => {
      expect(initialize(MS.Number)).toBe(0);
    });
    it('uses passed in value', () => {
      expect(initialize(MS.Number, 3)).toBe(3);
    });
  });
  describe('Array', () => {
    it(`uses types's initializer`, () => {
      expect(initialize(MS.Array)).toEqual([]);
    });
    it('uses passed in value', () => {
      expect(initialize(MS.Array, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });
  describe('Boolean', () => {
    it(`uses types's initializer`, () => {
      expect(initialize(MS.Boolean)).toBe(false);
    });
    it('uses passed in value', () => {
      expect(initialize(MS.Boolean, true)).toBe(true);
    });
  });
  describe('ObjectType', () => {
    it(`uses types's initializer`, () => {
      expect(initialize(MS.Object)).toEqual({});
    });
    it('uses passed in value', () => {
      expect(initialize(MS.Object, { hello: 'world' })).toEqual({
        hello: 'world',
      });
    });
  });
  describe('String', () => {
    it(`uses types's initializer`, () => {
      expect(initialize(MS.String)).toBe('');
    });
    it('uses passed in value', () => {
      expect(initialize(MS.String, 'hello world')).toBe('hello world');
    });
  });
});
