import 'jest';
import '../src/typeclasses';
import { parameterized } from '../src/types/parameters';
import analyze from '../src/structure';
import { map } from 'funcadelic';
import { collapse } from '../src/typeclasses/collapse';

function node(Type, value) {
  return analyze(Type, value).data;
}

class User {
  firstName = String
  lastName = String

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

describe('State', () => {
  describe("of an Number", () => {
    it('is the same as the value', function() {
      expect(node(Number, 5).stateAt(5)).toEqual(5);
    });
  });
  describe('of a Boolean', function() {
    it('is the same as the value', function() {
      expect(node(Boolean, true).stateAt(true)).toEqual(true);
    });
  });
  describe('of a String', function() {
    it('is the same as the value', function() {
      expect(node(String, 'Hello').stateAt('Hello')).toEqual('Hello');
    });
  });
  describe('of a non-simple type', function() {
    it('is an instance of that type', function() {
      let tree = analyze(User, {firstName: 'Charles', lastName: 'Lowell'});
      let state = collapse(map(node => node.stateAt({firstName: 'Charles', lastName: 'Lowell'}), tree));
      expect(state).toBeInstanceOf(User);
      expect(state.firstName).toEqual('Charles');
      expect(state.lastName).toEqual('Lowell');
      expect(state.fullName).toEqual('Charles Lowell');
    });
  });
});
