import 'jest';
import { map } from 'funcadelic';
import microstate, * as MS from '../src';

class Type {
  n = 10;
  b = true;
  s = 'hello';
  o = { hello: 'world' };
  a = ['a', 'b', 'c'];
  null = null;
  greeting = MS.String;
}

describe('constants support', () => {
  let ms, next;
  beforeEach(() => {
    ms = microstate(Type);
    next = ms.greeting.set('HI');
  });
  it('includes constants in state tree', () => {
    expect(ms.state).toEqual({
      n: 10,
      b: true,
      s: 'hello',
      o: { hello: 'world' },
      a: ['a', 'b', 'c'],
      null: null,
      greeting: '',
    });
  });
  it('constants are not included in valueOf', () => {
    expect(ms.valueOf()).toBeUndefined();
  });
  it('next state has constants', () => {
    expect(next.state).toEqual({
      n: 10,
      b: true,
      s: 'hello',
      o: { hello: 'world' },
      a: ['a', 'b', 'c'],
      null: null,
      greeting: 'HI',
    });
  });
  it('next valueOf excludes constants', () => {
    expect(next.valueOf()).toEqual({ greeting: 'HI' });
  });
  it.skip('shares complex objects between multiple instances of microstate', () => {
    expect(ms.state.o).toBe(microstate(Type).state.o);
  });
});