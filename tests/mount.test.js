import expect from 'expect';
import { create } from '../src/microstates';
import { mount, valueOf, pathOf } from '../src/meta';

describe('mounting', function() {

  class Node {}
  let parent, child, mounted

  beforeEach(function() {
    parent = create(Node);
    child = create(Node);
    mounted = mount(parent, child, 'child');
  });
  it('has the right path', function() {
    expect(pathOf(mounted)).toEqual(['child'])
  });

  describe('transitioning', function() {
    let next;
    beforeEach(function() {
      next = mounted.set('next value');
    });
    it('returns a parent', function() {
      expect(valueOf(next)).toEqual({child: 'next value'});
    });
  });

});
