/* global describe, it */

import expect from 'expect';

import objectOf from '../src/object-of';

describe('objectOf', ()=> {
  describe('null', ()=> {
    it('it converts null to an object', ()=> {
      expect(typeof objectOf(null)).toBe('object');
    });
    it('has a valueOf() null', ()=> {
      expect(objectOf(null).valueOf()).toBe(null);
    });
  });

  describe('undefined', ()=> {
    it('converts undefined into an object', ()=> {
      expect(typeof objectOf(undefined)).toBe('object');
    });
    it('has a valueOf() undefined', ()=> {
      expect(objectOf(undefined).valueOf()).toBe(undefined);
    });
  });

  describe('primitives', ()=> {
    it('converts into their corresponding box', ()=> {
      expect(typeof objectOf(5)).toBe('object');
      expect(objectOf(5)).toBeInstanceOf(Number);
      expect(objectOf(5).valueOf()).toBe(5);
    });
  });

  describe('everything else', ()=> {
    it('leaves as-is', ()=> {
      let object = {};
      expect(objectOf(object)).toBe(object);
    });
  });
});
