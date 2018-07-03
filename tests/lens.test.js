import { expect } from 'chai';
import { compose, view, over, set, Prop, Path, transparent, Lens } from '../src/lens';
import { append } from 'funcadelic';
import { create, Substate } from '../src/picostates';

describe('substate lenses', function() {
  class Parent {}
  class Child {}
  let child = new Child();
  let parent = new Parent();
  let lens
  beforeEach(function() {
    lens = Substate('child');
  });

  it('set-get: view retrievs what set put in', function() {
    let next = set(lens, child, parent);
    expect(next.child).to.be.instanceof(Child);
    expect(view(lens, next)).to.equal(child);
  });
  it('get-set: If you set focus to the same value it has, the whole does not change', function() {
    let next = set(lens, child, parent);
    expect(set(lens, child, next)).to.equal(next);
  });
  // it('set-set: Setting the focus twice is the same as setting it once.', function() {

  // });

});
