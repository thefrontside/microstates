import 'jest';

import Tree from '../src/tree';

describe("A Boolean Tree with a value provided", () => {
  let tree;
  beforeEach(function() {
    tree = new Tree({
      Type: Boolean,
      value: false
    });
  });
  it('has a type', () => {
    expect(tree.Type).toEqual(Boolean);
  });
  it('has a value', () => {
    expect(tree.value).toEqual(false);
  });
  it('has path defaulting to the empty array', () => {
    expect(tree.path).toEqual([]);
  });
  it('has a stable state equivalent to the value', () => {
    expect(tree.state).toEqual(tree.state);
    expect(tree.state).toEqual(false);
  });
  it('has a set transition', () => {
    expect(tree.transitions.set).toBeInstanceOf(Function);
  });
  it('has a toggle transition', () => {
    expect(tree.transitions.toggle).toBeInstanceOf(Function);
  });
});

describe("A Composed Tree with value provided", () => {
  let tree;
  class Person {
    name = String;
  }
  beforeEach(() => {
    tree = new Tree({
      Type: Person,
      value: { name: 'Taras' },
    })
  });
  it('has name child', () => {
    expect(tree.children.name).toBeInstanceOf(Tree);
  });
  describe('name child', () => {
    it('is of Type String', () => {
      expect(tree.children.name.Type).toBe(String);
    });
    it('has value', () => {
      expect(tree.children.name.value).toBe('Taras');
    });
  });
});

describe('A Boolean Tree with no value provided', () => {

});
