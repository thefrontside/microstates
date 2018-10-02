import expect from 'expect';

import { Constant, create } from '../src/microstates';
import { StringType } from '../src/types';
import { valueOf } from '../src/meta';

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
  it('includes constants in state tree', () => {
    expect(ms.n.state).toEqual(10);
    expect(ms.b.state).toEqual(true);
    expect(ms.s.state).toEqual('hello');
    expect(ms.o.state).toEqual({hello: 'world'});
    expect(ms.a.state).toEqual(['a', 'b', 'c']);
    expect(ms.null.state).toEqual(null);
    expect(ms.greeting.state).toEqual('');
  });
  it('next state has constants', () => {
    expect(next.n.state).toEqual(10);
    expect(next.b.state).toEqual(true);
    expect(next.s.state).toEqual('hello');
    expect(next.o.state).toEqual({hello: 'world'});
    expect(next.a.state).toEqual(['a', 'b', 'c']);
    expect(next.null.state).toEqual(null);
    expect(next.greeting.state).toEqual('HI');
  });
  it('next valueOf excludes constants', () => {
    expect(next.greeting.state).toEqual('HI');
  });
  it('shares complex objects between multiple instances of microstate', () => {
    expect(ms.o.state).toBe(create(Type, {}).o.state);
  });
});
