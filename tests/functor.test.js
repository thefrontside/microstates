import 'jest';
import { map } from 'funcadelic';
import microstate, * as MS from '../src';

describe('functor', function() {
  class MyType {
    myProp = MS.String;
  }
  let actions;
  beforeEach(() => {
    actions = map(transition => (...args) => transition(...args), microstate(MyType));
  })
  it('keeps objects as objects', () => {
    expect(actions).toMatchObject({
      set: expect.any(Function),
      myProp: {
        set: expect.any(Function),
      },
    });
  });
  it('has working transitions', () => {
    expect(actions.myProp.set('foo').state).toEqual({ myProp: 'foo' });
  });
});