/* global describe, it, beforeEach */
import expect from 'expect';
import { compose, view, set, At } from '../src/lens';

describe('At', function() {
  let lens;
  beforeEach(function() {
    lens = compose(At(0, []), At("hello"));
  });

  it('instantiates objects of the correct type at each path', function() {
    expect(set(lens, "world", undefined)).toEqual([{hello: 'world'}]);
  });

  it('set-get: view retrievs what set put in', function() {
    let cookie = {};
    let object = set(lens, cookie, undefined);
    expect(view(lens, object)).toBe(cookie);
  });

  it('get-set: If you set focus to the same value it has, the whole does not change', function() {
    let object = set(lens, "world", undefined);
    expect(set(lens, "world", object)).toBe(object);
  });

  it('uses primitive values to compare if two things are equal', ()=> {
    let initial = [{ hello: 'world' }];
    expect(set(lens, new String('world'), initial)).toBe(initial);
  });
});
