import { map } from 'funcadelic';

import ArrayState from '../../src/primitives/array';
import BooleanState from '../../src/primitives/boolean';
import NumberState from '../../src/primitives/number';
import ObjectState from '../../src/primitives/object';
import StringState from '../../src/primitives/string';
import Tree from '../../src/utils/tree';
import treeFromType from '../../src/utils/tree-from-type';

describe('treeFromType', () => {
  describe('from a microstate schema', function() {
    let tree;
    class Person {
      name = String;
      parent = Person;
    }
    beforeEach(function() {
      tree = treeFromType(Person);
    });
    it('constructs the tree lazily', function() {
      expect(tree).toHaveProperty('children.parent.data.Type', Person);
    });
    it('records the path data as you descend down the tree', function() {
      expect(tree).toHaveProperty('data.path', []);
      expect(tree).toHaveProperty('children.name.data.path', ['name']);
    });
  });

  describe('map support', () => {
    describe('from primitive', () => {
      let callback, tree;
      beforeEach(() => {
        callback = jest.fn();
        tree = map(callback, treeFromType(Number));
      });
      it('is not invoked until something is read. once', () => {
        expect(callback).not.toHaveBeenCalled();
      });
      describe('reading data', () => {
        beforeEach(() => {
          tree.data;
        });
        it('received tree data as first argument', () => {
          expect(callback.mock.calls[0][0]).toHaveProperty('isPrimitive', true);
          expect(callback.mock.calls[0][0]).toHaveProperty('transitions.increment');
        });
      });
    });
    describe('from composed', () => {
      class Item {
        name = String;
        child = Item;
      }
      describe('root', () => {
        let callback;
        let tree;
        beforeEach(() => {
          callback = jest.fn().mockImplementation(node => (node.isPrimitive ? 'foo' : {}));
          tree = map(callback, treeFromType(Item));
          tree.data;
        });
        it('is invoked only once', () => {
          expect(callback).toHaveBeenCalled();
        });
        it('received composed node', () => {
          expect(callback).toHaveProperty('mock.calls.0.0.isPrimitive', false);
        });
      });
      describe('composed states', () => {
        let callback;
        let tree;
        beforeEach(() => {
          callback = jest.fn().mockImplementation(node => (node.isPrimitive ? 'foo' : {}));
          tree = map(callback, treeFromType(Item));
          tree.data;
          tree.children.name.data;
          tree.children.child.data;
        });
        it('was called 3 types', () => {
          expect(callback).toHaveBeenCalledTimes(3);
        });
        it('sent string node to the callback', () => {
          expect(callback).toHaveProperty('mock.calls.1.0.Type', String);
          expect(callback).toHaveProperty('mock.calls.1.0.path', ['name']);
        });
        it('sent composed node to the callback', () => {
          expect(callback).toHaveProperty('mock.calls.2.0.Type', Item);
          expect(callback).toHaveProperty('mock.calls.2.0.path', ['child']);
        });
      });
    });
  });
  describe('primitives', () => {
    it('builds tree for Number', () => {
      expect(treeFromType(Number).data).toMatchObject({
        path: [],
        isPrimitive: true,
        Type: Number,
        type: NumberState,
        initialize: expect.any(Function),
        transitions: expect.objectContaining({
          set: expect.any(Function),
          increment: expect.any(Function),
        }),
      });
    });
    it('builds tree for String', () => {
      expect(treeFromType(String).data).toMatchObject({
        path: [],
        isPrimitive: true,
        Type: String,
        type: StringState,
        initialize: expect.any(Function),
        transitions: expect.objectContaining({
          set: expect.any(Function),
          concat: expect.any(Function),
        }),
      });
    });
    it('builds tree for Boolean', () => {
      expect(treeFromType(Boolean).data).toMatchObject({
        path: [],
        isPrimitive: true,
        Type: Boolean,
        type: BooleanState,
        initialize: expect.any(Function),
        transitions: expect.objectContaining({
          set: expect.any(Function),
          toggle: expect.any(Function),
        }),
      });
    });
    it('builds tree for Object', () => {
      expect(treeFromType(Object).data).toMatchObject({
        path: [],
        isPrimitive: true,
        Type: Object,
        type: ObjectState,
        initialize: expect.any(Function),
        transitions: expect.objectContaining({
          set: expect.any(Function),
          assign: expect.any(Function),
        }),
      });
    });
    it('builds tree for Array', () => {
      expect(treeFromType(Array).data).toMatchObject({
        path: [],
        isPrimitive: true,
        Type: Array,
        type: ArrayState,
        initialize: expect.any(Function),
        transitions: expect.objectContaining({
          set: expect.any(Function),
          push: expect.any(Function),
        }),
      });
    });
  });
  describe('composed', () => {
    describe('objects', () => {
      describe('transitions', () => {
        let tree;
        beforeEach(() => {
          tree = treeFromType(class {});
        });
        it('has set', () => {
          expect(tree.data.transitions.set).toBeDefined();
        });
        it('has merge', () => {
          expect(tree.data.transitions.merge).toBeDefined();
        });
        describe('initialize', () => {
          class WithInitialize {
            initialize() {
              return {};
            }
          }
          it('initialize transition is used when present', () => {
            expect(treeFromType(WithInitialize)).toHaveProperty(
              'data.initialize',
              WithInitialize.prototype.initialize
            );
          });
          describe('default', () => {
            let args, tree, p;
            class Plain {
              constructor(..._args) {
                args = _args;
              }
            }
            beforeEach(() => {
              tree = treeFromType(Plain);
              p = tree.data.initialize('a', 'b', 'c');
            });
            it('receives default when not specified', () => {
              expect(tree).toHaveProperty('data.initialize');
            });
            it('returns new instance of type', () => {
              expect(p).toBeInstanceOf(Plain);
            });
            it('passes args to constructor', () => {
              expect(args).toEqual(['a', 'b', 'c']);
            });
          });
        });
      });
      it('without properties', () => {
        class Item {}
        let tree = treeFromType(Item);
        expect(treeFromType(Item).data).toMatchObject({
          path: [],
          isPrimitive: false,
          type: Item,
          Type: Item,
        });
      });
      describe('with children', () => {
        class Item {
          string = String;
          number = Number;
          boolean = Boolean;
          object = Object;
          array = Array;
        }
        let tree = treeFromType(Item);
        it('have paths', () => {
          expect(tree).toHaveProperty('children.string.data.path', ['string']);
          expect(tree).toHaveProperty('children.number.data.path', ['number']);
          expect(tree).toHaveProperty('children.boolean.data.path', ['boolean']);
          expect(tree).toHaveProperty('children.object.data.path', ['object']);
          expect(tree).toHaveProperty('children.array.data.path', ['array']);
        });
        it('have fields', () => {
          expect(tree).toHaveProperty('children.string.data.isPrimitive', true);
          expect(tree).toHaveProperty('children.number.data.isPrimitive', true);
          expect(tree).toHaveProperty('children.boolean.data.isPrimitive', true);
          expect(tree).toHaveProperty('children.object.data.isPrimitive', true);
          expect(tree).toHaveProperty('children.array.data.isPrimitive', true);
        });
      });
      describe('composed properties', () => {
        class Child {
          name = String;
        }
        class Parent {
          name = String;
          child = Child;
        }
        let tree = treeFromType(Parent);
        it('are present', () => {
          expect(Object.keys(tree.children).length).toBe(2);
          expect(tree.children.child).toHaveProperty('data.path', ['child']);
          expect(tree.children.child).toHaveProperty('data.isPrimitive', false);
          expect(tree.children.child).toHaveProperty('data.Type', Child);
          expect(tree.children.child).toHaveProperty('data.type', Child);
          expect(tree.children.child.children.name).toHaveProperty('data.isPrimitive', true);
        });
      });
      it('supports circular composed objects', () => {
        class Item {
          item = Item;
        }
        let tree = treeFromType(Item);
        expect(tree.children.item).toBeInstanceOf(Tree);
        expect(tree.children.item.data.type).toBe(Item);
        expect(tree.children.item.children.item).toBeInstanceOf(Tree);
        expect(tree.children.item.children.item.data.type).toBe(Item);
        expect(tree.children.item.children.item.data.path).toEqual(['item', 'item']);
      });
    });
  });
  describe('map', () => {
    describe('callback', () => {
      let describe_for = Type => {
        let it_received = (property, expected) => {
          it(`is object with ${property} equal to ${expected}`, () => {
            expect(callback).toHaveProperty(`mock.calls.0.0.${property}`, expected);
          });
        };
        let callback;
        describe(`for ${Type.name}`, () => {
          beforeEach(() => {
            callback = jest.fn().mockImplementation(node => {});
            map(callback, treeFromType(Type)).data;
          });
          it('is called once', () => {
            expect(callback).toHaveBeenCalledTimes(1);
          });
          describe('first argument', () => {
            it_received('isPrimitive', true);
            it('is an object with transitions object as first argument', () => {
              expect(callback.mock.calls[0][0].transitions).toBeInstanceOf(Object);
            });
          });
        });
      };
      describe_for(Number);
      describe_for(String);
      describe_for(Boolean);
      describe_for(Object);
      describe_for(Array);
      describe('for shallow composed state', () => {
        let callback;
        beforeEach(() => {
          callback = jest.fn();
          class Person {
            name = String;
          }
          map(callback, treeFromType(Person)).data;
        });
        it('is called once', () => {
          expect(callback).toHaveBeenCalledTimes(1);
        });
        describe('first argument', () => {
          it('is an object with isPrimitive equal false', () => {
            expect(callback).toHaveProperty('mock.calls.0.0.isPrimitive', false);
          });
          it('is has merge transition', () => {
            expect(callback.mock.calls[0][0].transitions.merge).toBeDefined();
          });
        });
        describe('second argument', () => {
          let callback;
          beforeEach(() => {
            callback = jest.fn().mockImplementation(() => {});
            class Person {
              name = String;
              parent = Person;
            }
            let tree = map(callback, treeFromType(Person));
            tree.data;
            tree.children.parent.data;
            tree.children.parent.children.name.data;
            tree.children.parent.children.parent.data;
          });
          it('was called three times', () => {
            expect(callback).toHaveBeenCalledTimes(4);
          });
          it('recieved empty array on 1st call', () => {
            expect(callback).toHaveProperty('mock.calls.0.0.path', []);
          });
          it('received [parent] on 2nd call', () => {
            expect(callback).toHaveProperty('mock.calls.1.0.path', ['parent']);
          });
          it('received [parent, name] on 3nd call', () => {
            expect(callback).toHaveProperty('mock.calls.2.0.path', ['parent', 'name']);
          });
          it('received [parent, parent] on 3th call', () => {
            expect(callback).toHaveProperty('mock.calls.3.0.path', ['parent', 'parent']);
          });
        });
      });
    });
  });
});
