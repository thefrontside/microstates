import 'jest';

import Tree, { transitionsConstructorFor } from '../src/tree';

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
  it('has stable transitions', () => {
    expect(tree.transitions).toBe(tree.transitions);
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
  it('has stable children', () => {
    expect(tree.children).toBe(tree.children);
  });
  it('has stable state', () => {
    expect(tree.state).toBeInstanceOf(Person);
    expect(tree.state).toBe(tree.state);
  });
  describe('name child', () => {
    it('is of Type String', () => {
      expect(tree.children.name.Type).toBe(String);
    });
    it('has value', () => {
      expect(tree.children.name.value).toBe('Taras');
    });
  });
  describe('transitions', () => {
    it('has composed transition', () => {
      expect(tree.transitions.name).toBeDefined();
    });
    it('has set on name', () => {
      expect(tree.transitions.name.set).toBeInstanceOf(Function);
    });
  });
});

describe('Transitions', () => {

  class Person { 
    read(book) {
      return `reading ${book}`;
    }
  }

  describe('transitionsConstructorFor', () => {

    let PersonTransitions = transitionsConstructorFor(Person);

    it('allows transitions to be moved', () => {
      let { read } = new PersonTransitions();
      expect(read('comics')).toBe('reading comics');
    });

  });

});

describe('value', () => {
  it('is stable when passed a function', () => {
    let tree = new Tree({ Type: String, value: () => ({}) });
    expect(tree.value).toBe(tree.value);
  });
});