import 'jest';

import Tree, { transitionsConstructorFor } from '../src/tree';
import { flatMap, map } from 'funcadelic';
import view from 'ramda/src/view';
import set from 'ramda/src/set';
import over from 'ramda/src/over';

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
    parent = Person;
    read(book) {
      return `reading ${book}`;
    }
  }

  describe('calling transition at root tree', () => {
    let root, invoke, result;

    beforeEach(() => {
      invoke = jest.fn((tree, method) => new Tree({ Type: tree.Type, value: 'hello world'} ));
      root = new Tree({ Type: Person, invoke });
      result = root.transitions.read(root);
    });

    it('returns a tree', () => {
      expect(result).toBeInstanceOf(Tree);
    });

    it('callback is called', () => {
      expect(invoke).toHaveBeenCalledTimes(1);
    });

    it('callback receives tree and function', () => {
      expect(invoke).toHaveBeenCalledWith(expect.any(Tree), expect.any(Function));
    });

    it('received tree is rooted', () => {
      expect(invoke.mock.calls[0][0].path).toEqual([]);
      expect(invoke.mock.calls[0][0].Type).toBe(Person);
    });

    it('has returned value', () => {
      expect(result.value).toEqual('hello world');
    });

  });

  describe('calling transition on deeply nested tree', () => {
    let root, invoke, result;

    beforeEach(() => {
      invoke = jest.fn((tree, method) => new Tree({ Type: tree.Type, value: 'hello world'} ));
      root = new Tree({ Type: Person, invoke });
      result = root.transitions.parent.parent.read(root);
    });

    it('returns a tree', () => {
      expect(result).toBeInstanceOf(Tree);
    });

    it('callback is called', () => {
      expect(invoke).toHaveBeenCalledTimes(1);
    });

    it('callback receives tree and function', () => {
      expect(invoke).toHaveBeenCalledWith(expect.any(Tree), expect.any(Function));
    });

    it('received tree is rooted', () => {
      expect(invoke.mock.calls[0][0].path).toEqual([]);
      expect(invoke.mock.calls[0][0].Type).toBe(Person);
    });

    it('has returned value', () => {
      expect(result.value).toEqual({ parent: { parent: 'hello world' }});
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

  describe('Monad', () => {
    class Thang {
      name = String;
    }
    class Thangs {
      a = Thang;
      b = Thang;
    }

    let flatMapped;
    beforeEach(() => {
      flatMapped = flatMap((tree) => {
        if (tree.Type === Things) {
          return new Tree({ Type: Thangs, value: () => tree.value});
        } else if (tree.Type === Thang) {
          return new Tree({ Type: Thang, value: { name: `Hallo ${tree.children.name.value}!` }, path: ['wut', 'heck', 'no'] });
        } else {
          return tree;
        }
      }, things);
    });

    it('allows you to change the type of a tree', function() {
      expect(flatMapped.Type).toBe(Thangs);
    });
    it('recursively flatMaps the children', function() {
      expect(flatMapped.children.a.children.name.value).toBe('Hallo A!');
    });
    it('preserves the path', function() {
      expect(flatMapped.children.a.path).toEqual(['a']);
    });
  })

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

  describe('lens', () => {
    let viewed, changed, overed;
    beforeEach(() => {
      let { lens } = new Tree({ Type: String, path: ['a', 'name'] });
      viewed = view(lens, things);
      changed = set(lens, new Tree({ value: 'boo' }), things);
      overed = over(lens, focus => new Tree({ value: () => `${focus.value} BUAHAHA` }), things);
    });

    it('can be used as a lens', () => {
      expect(viewed.Type).toBe(String);
    });

    it('prunes the focused value', () => {
      expect(viewed.path).toEqual([]);
    });

    it('view keeps the value unchanged', () => {
      expect(viewed.value).toBe('A');
    });

    it('sets the value into every node in the branch', () => {
      expect(changed.value).toEqual({ a: { name: 'boo' }, b: { name: 'B' }});
      expect(changed.children.a.value).toEqual({ name: 'boo' });
      expect(changed.children.a.children.name.value).toEqual('boo');
    });

    it('does not set nodes in other branch', () => {
      expect(changed.children.b.value).toEqual({ name: 'B' });
      expect(changed.children.b.children.name.value).toEqual('B');
    });

    it('overed the value', () => {
      expect(overed.value).toEqual({ a: { name: 'A BUAHAHA' }, b: { name: 'B' }});
      expect(overed.children.b.value).toEqual({ name: 'B' });
      expect(overed.children.a.children.name.value).toEqual('A BUAHAHA');
    });

    it('overed state is stable', () => {
      expect(overed.state).toBe(overed.state);
    });

    it('overed state is different from original state', () => {
      expect(overed.state).not.toBe(things.state);
    });

    it('allows over to be called on the tree', () => {
      let { lens } = new Tree({ Type: String, path: ['a', 'name'] });
      let fn = focus => new Tree({ value: () => `${focus.value} BUAHAHA` });
      expect(things.over(lens, fn).value).toEqual({ a: { name: 'A BUAHAHA' }, b: { name: 'B' }});
    });

  });

});
