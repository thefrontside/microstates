import 'jest';

import Tree, { transitionsConstructorFor } from '../src/tree';
import { map } from 'funcadelic';

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

describe('Tree', () => {

  let a, things;
  class Thing {
    name = String;
  }

  class Things {
    a = Thing;
    b = Thing;
  }

  beforeEach(() => {
    a = new Tree({ Type: String });
    things = new Tree({ Type: Things, value: { a: { name: 'A' }, b: { name: 'B' }} });
  });

  describe('Functor', () => {

    it('returns the mapped tree', () => {
      let mapped = map(() => ({}), a);
      expect(mapped).toBeInstanceOf(Tree);
      expect(mapped.Type).toBe(a.Type);
      expect(mapped.stable).toBe(a.stable);
      expect(mapped.path).toBe(a.path);
    });

    it('allows to map tree and change path', () => {
      let mapped = map(() => ({ path: ['name'] }), a);
      expect(mapped.path).toEqual(['name']);
    });

    it('allows to change value by returning a new tree', () => {
      let mapped = map(() => new Tree({ Type: String, value: 'hello world' }), a);
      expect(mapped.state).toBe('hello world');
    });

    it('preserves stablility when mapping nested trees', () => {
      let mapped = map(() => ({}), things);

      expect(mapped.value).toBe(things.value);
      expect(mapped.state).toBe(things.state);
      expect(mapped.children.a.state).toBe(things.children.a.state);
    });

    it('has stable children on mapped trees', () => {
      let mapped = map(() => ({}), things);

      expect(mapped.children).toBe(mapped.children);
      expect(mapped.children.a).toBe(mapped.children.a);
    });

  });

  describe('prune', () => {
    let pruned;

    beforeEach(() => {
      pruned = things.children.a.prune();
    });

    it('allows a tree to be moved to root', () => {
      expect(pruned.path).toEqual([]);
      expect(pruned.value).toBe(things.children.a.value);
    });

    it('applies prune to children', () => {
      expect(pruned.children.name.path).toEqual(['name']);
    });
  });

  describe('graft', () => {
    let grafted;

    beforeEach(() => {
      grafted = things.graft(['one', 'two']);
    });

    it('prefixes each node in the tree', () => {
      expect(grafted.path).toEqual(['one', 'two']);
      expect(grafted.children.a.path).toEqual(['one', 'two', 'a']);
      expect(grafted.children.a.children.name.path).toEqual(['one', 'two', 'a', 'name']);
    });

    it('does not change the value', () => {
      expect(grafted.value).toBe(things.value);
    });

    it('does not change the state', () => {
      expect(grafted.state).toBe(things.state);
    });
  });

});