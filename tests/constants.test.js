import expect from 'expect';

import { Constant, create } from '../src/microstates';
import { StringType } from '../src/types';

let o = { hello: 'world' };
class Type {
  n = 10;
  b = true;
  s = 'hello';
  o = o;
  a = ['a', 'b', 'c'];
  null = null;
  greeting = String;
}

describe('constants support', () => {
  let ms, next;
  beforeEach(() => {
    ms = create(Type, {});
    next = ms.greeting.set('HI');
  });
  it('propagates the values out to the contants', () => {
    expect(ms.n.state).toEqual(10);
    expect(ms.b.state).toEqual(true);
    expect(ms.s.state).toEqual('hello');
    expect(ms.o.state).toBe(o);
    expect(ms.a.state).toEqual(["a", "b", "c"]);
    expect(ms.null.state).toEqual(null);
    expect(ms.greeting.state).toEqual('');
    expect(ms.state).toEqual({});
  });
  it('next state contains the difference from the first', () => {
    expect(next.state).toEqual({
      greeting: 'HI',
    });
  });
  it('next valueOf excludes constants', () => {
    expect(next.greeting.state).toEqual('HI');
  });
  it('shares complex objects between multiple instances of microstate', () => {
    expect(ms.state.o).toBe(create(Type, {}).state.o);
  });
});
