import expect from 'expect';
import { view, set } from '../src/lens';
import { append } from 'funcadelic';
import { create, Meta } from '../src/microstates';

describe('substate lenses', function() {
  class Parent {}
  class Child {}
  let child = new Child();
  let parent = new Parent();
  let lens
  beforeEach(function() {
    lens = Meta.At('child');
  });

  it('set-get: view retrievs what set put in', function() {
    let next = set(lens, child, parent);
    expect(next.child).toBeInstanceOf(Child);
    expect(view(lens, next)).toBe(child);
  });
  it('get-set: If you set focus to the same value it has, the whole does not change', function() {
    let next = set(lens, child, parent);
    expect(set(lens, child, next)).toBe(next);
  });
});
