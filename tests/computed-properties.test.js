import 'jest';
import { map } from 'funcadelic';
import Microstate from '../src';

class State {
  firstName = String;
  lastName = String;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toUpperCase(state) {
    return this
      .firstName.set(state.firstName.toUpperCase())
      .lastName.set(state.lastName.toUpperCase());
  }
}

describe('without initial state', () => {
  let ms;
  beforeEach(() => {
    ms = Microstate.create(State);
  });
  it('is computed', function() {
    expect(ms.state.fullName).toEqual(' ');
  });
});
describe('with initial state', () => {
  let ms;
  beforeEach(() => {
    ms = Microstate.create(State, { firstName: 'Peter', lastName: 'Griffin' });
  });
  it('is computed', () => {
    expect(ms.state.fullName).toEqual('Peter Griffin');
  });
  it('should not have getters in valueOf after custom transition', () => {
    expect(ms.toUpperCase().valueOf()).not.toHaveProperty('fullName');
  });
});