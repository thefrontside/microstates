import view from 'ramda/src/view';
import set from 'ramda/src/set';

import 'jest';

import typeLensPath from '../../src/utils/type-lens-path';
import * as MS from '../../src';
import Tree from '../../src/utils/tree';

describe('typeLensPath', () => {
  class Person {
    firstName = MS.String;
    lastName = MS.String;
  }
  class State {
    count = MS.Number;
    person = Person;
  }
  class Vehicle {
    color = MS.String;
  }
  describe('view', () => {
    it('returns root for empty path', () => {
      expect(view(typeLensPath([]), State)).toBe(State);
    });
    it('returns shallow child', () => {
      expect(view(typeLensPath(['count']), State)).toBe(MS.Number);
    });
    it('returns deep child', () => {
      expect(view(typeLensPath(['person', 'firstName']), State)).toBe(MS.String);
    });
  });
  describe('set', () => {
    it('throws an error when 3rd argument is not a tree', () => {
      expect(function() {
        set(typeLensPath([]), MS.Number, undefined);
      }).toThrowError(`treeLensPath expects Type class as 3rd argument, received undefined`);
      expect(function() {
        set(typeLensPath([]), MS.Number, {});
      }).toThrowError(`treeLensPath expects Type class as 3rd argument, received object`);
    });
    it('replaces root', () => {
      expect(set(typeLensPath([]), Vehicle, State)).toBe(Vehicle);
    });
    it('sets shallow property', () => {
      let Type = set(typeLensPath(['a']), 'VALUE', State);
      expect(Type).not.toBe(State);
      expect(new Type()).toMatchObject({
        count: MS.Number,
        person: Person,
        a: 'VALUE',
      });
    });
    it('sets deep property', () => {
      let Type = set(typeLensPath(['person', 'age']), 36, State);
      let type = new Type();
      let nextPerson = type.person;
      expect(type).toHaveProperty('count', MS.Number);
      expect(type.person).not.toBe(Person);
      expect(type.person).toBeInstanceOf(Function);
      expect(new nextPerson()).toMatchObject({
        firstName: MS.String,
        lastName: MS.String,
        age: 36,
      });
    });
    it('throws an error when attribute is not present', () => {
      expect(function() {
        set(typeLensPath(['a', 'b']), 'VALUE', State);
      }).toThrowError(`State doesn't have attribute a`);
    });
  });
});
