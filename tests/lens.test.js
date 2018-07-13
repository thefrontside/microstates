import expect from 'expect';
import { compose, view, over, set, Prop, Path, transparent, Lens } from '../src/lens';
import { append } from 'funcadelic';
import { create, SubstateAt } from '../src/microstates';

describe('substate lenses', function() {
  class Parent {}
  class Child {}
  let child = new Child();
  let parent = new Parent();
  let lens
  beforeEach(function() {
    lens = SubstateAt('child');
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
