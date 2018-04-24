import 'jest';

import Tree from '../src/tree';

describe("A Boolean Tree with a value provided", function () {
  let tree;
  beforeEach(function() {
    tree = new Tree({
      Type: Boolean,
      value: false
    });

  });
  it('has a type', function() {
    expect(tree.Type).toEqual(Boolean);
  });
  it('has a value', function() {
    expect(tree.value).toEqual(false);
  });
  it('has path defaulting to the empty array', function() {
    expect(tree.path).toEqual([]);
  });
  it('has a stable state equivalent to the value', function() {
    expect(tree.state).toEqual(tree.state);
    expect(tree.state).toEqual(false);
  });
  it('has a set transition', function() {

  });
  it('has a toggle transition', function() {

  });
});

describe('A Boolean Tree with no value provided', function() {

});
