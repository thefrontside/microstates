import 'jest';

import types from '../src/types';
import Tree, { Microstate, reveal } from '../src/tree';
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
    expect(tree.Type).toEqual(types.Boolean);
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
    expect(tree.microstate.set).toBeInstanceOf(Function);
  });
  it('has a toggle transition', () => {
    expect(tree.microstate.toggle).toBeInstanceOf(Function);
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
      expect(tree.children.name.Type).toBe(types.String);
    });
    it('has value', () => {
      expect(tree.children.name.value).toBe('Taras');
    });
  });
  describe('transitions', () => {
    it('has composed transition', () => {
      expect(tree.microstate.name).toBeDefined();
    });
    it('has set on name', () => {
      expect(tree.microstate.name.set).toBeInstanceOf(Function);
    });
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
    it('makes sure all of the values have referential integrety', function() {
      expect(flatMapped.value.a).toBe(flatMapped.children.a.value);
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
      expect(viewed.Type).toBe(types.String);
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

  });

  describe('isPrimitive', () => {
    it('is true for Boolean', () => {
      expect(new Tree({ Type: Boolean })).toHaveProperty('isPrimitive', true);
      expect(new Tree({ Type: Boolean, value: true })).toHaveProperty('isPrimitive', true);
    });
    it('is true for String', () => {
      expect(new Tree({ Type: String })).toHaveProperty('isPrimitive', true);
      expect(new Tree({ Type: String, value: 'foo' })).toHaveProperty('isPrimitive', true);
    });
    it('is true for Number', () => {
      expect(new Tree({ Type: Number })).toHaveProperty('isPrimitive', true);
      expect(new Tree({ Type: Number, value: 10 })).toHaveProperty('isPrimitive', true);
    });
    it('is false for Object', () => {
      expect(new Tree({ Type: Object })).toHaveProperty('isPrimitive', false);
      expect(new Tree({ Type: Object, value: {} })).toHaveProperty('isPrimitive', false);
      expect(new Tree({ Type: Object, value: { foo: 'bar' } })).toHaveProperty('isPrimitive', false);
    });
    it('is false for Array', () => {
      expect(new Tree({ Type: Array })).toHaveProperty('isPrimitive', false);
      expect(new Tree({ Type: Array, value: [] })).toHaveProperty('isPrimitive', false);
      expect(new Tree({ Type: Array, value: [123] })).toHaveProperty('isPrimitive', false);
    });
  });

});

describe('Microstate', () => {
  describe('number', () => {
    let number;
    beforeEach(() => {
      number = Microstate.create(Number, 42);
    });

    it('has state', () => {
      expect(number.state).toBe(42);
    });

    it('has value', () => {
      expect(number.valueOf()).toBe(42);
    });

    it('has increment', () => {
      expect(number.increment).toBeInstanceOf(Function);
    });

    describe('first transition', () => {
      let next;
      beforeEach(() => {
        next = number.increment();
      });

      it('returns a microstate from a transtion', () => {
        expect(next).toBeInstanceOf(Microstate);
      });

      it('returns same type', () => {
        expect(reveal(next).Type).toBe(types.Number);
      });

      it('incremented the value', () => {
        expect(next.valueOf()).toBe(43);
      });

      describe('second transition', () => {
        let again;
        beforeEach(() => {
          again = next.increment();
        });

        it('return a microstate for second transition', () => {
          expect(again).toBeInstanceOf(Microstate);
        });

        it('passes value after 2nd transition', () => {
          expect(again.valueOf()).toBe(44);
        });
      });
    });
  });

  describe('composed type', () => {
    class Person {
      mother = Person;
      father = Person;
      name = String;
    }

    let person;
    beforeEach(() => {
      person = Microstate.create(Person, { name: 'Bart', mother: { name: 'Marge' } });
    });

    it('has stable state', () => {
      expect(person.state).toBe(person.state);
    });

    it('has state', () => {
      expect(person.state).toBeInstanceOf(Person);
      expect(person.state.mother).toBeInstanceOf(Person);
      expect(person.state.name).toBe('Bart');
      expect(person.state.mother.name).toBe('Marge');
    });

    it('has value', () => {
      expect(person.valueOf()).toEqual({ name: 'Bart', mother: { name: 'Marge' } });
    });

    describe('second transition', () => {
      let withFather, root, motherTree, fatherNameTree;
      beforeEach(() => {
        withFather = person.father.set({ name: 'Homer' });
        root = reveal(withFather);
        motherTree = reveal(withFather.mother);
        fatherNameTree = reveal(withFather.father.name);
      });

      it('maintained state after transition', () => {
        expect(withFather.state.mother.name).toBe('Marge');
      });

      it('has transitioned state', () => {
        expect(withFather.state.father.name).toBe('Homer');
      });

      it('mother is stable after transition', () => {
        expect(withFather.state.mother).toBe(person.state.mother);
      });

      it('has value', () => {
        expect(withFather.valueOf()).toEqual({ name: 'Bart', mother: { name: 'Marge' }, father: { name: 'Homer' } })
      });

      it('root on updated branch is same as unchanged branch', () => {
        expect(motherTree.root).toBe(root);
        expect(fatherNameTree.root).toBe(root);
      });

      describe('third transition', () => {
        let seniorHomer;
        beforeEach(() => {
          seniorHomer = withFather.father.name.set('Senior Homer');
        });
        it('has value after 2nd transition', () => {
          expect(seniorHomer.valueOf()).toEqual({ name: 'Bart', mother: { name: 'Marge' }, father: { name: 'Senior Homer'} })
        });
      });
    });
  });

  describe('middleware', () => {

    describe('shallow', () => {
      let boolean, mapped, beforeTransition, afterTransition;
      beforeEach(() => {
        boolean = Microstate.create(Boolean, true);
        beforeTransition = jest.fn();
        afterTransition = jest.fn();
        mapped = map(tree => tree.use(next => (microstate, transition, args) => {
          beforeTransition(microstate, transition, args);
          let result = next(microstate, transition, args);
          afterTransition(result);
          return result;
        }), boolean);
      });

      it('returns a microstate', () => {
        expect(mapped).toBeInstanceOf(Microstate);
      });

      it('has state', () => {
        expect(mapped.state).toBe(true);
      });

      it('has value', () => {
        expect(mapped.valueOf()).toBe(true);
      });

      describe('first transition', () => {
        let toggled;
        beforeEach(() => {
          toggled = mapped.toggle();
        });

        it('returns a microstate after transition', () => {
          expect(toggled).toBeInstanceOf(Microstate);
        });

        it('after transition it has the value', () => {
          expect(toggled.valueOf()).toBe(false);
        });

        it('called the beforeTransition once', () => {
          expect(beforeTransition).toHaveBeenCalledTimes(1);
        });

        it('called afterTransition once', () => {
          expect(afterTransition).toHaveBeenCalledTimes(1);
        });

        it('before transition state is true and after its false', () => {
          expect(beforeTransition.mock.calls[0][0].state).toBe(true);
          expect(afterTransition.mock.calls[0][0].state).toBe(false);
        });

        describe('second transtion', () => {
          let toggledTwice;

          beforeEach(() => {
            toggledTwice = toggled.toggle();
          });

          it('after second transition it has the value', () => {
            expect(toggledTwice.valueOf()).toBe(true);
          });

          it('called the callback twice', () => {
            expect(beforeTransition).toHaveBeenCalledTimes(2);
          });

          it('passed microstates to the callback', () => {
            expect(beforeTransition).toHaveBeenCalledWith(expect.any(Microstate), expect.any(Function), []);
          });

          it('before transition state is false after its true', () => {
            expect(beforeTransition.mock.calls[1][0].state).toBe(false);
            expect(afterTransition.mock.calls[1][0].state).toBe(true);
          });
        });
      });
    });

    describe('deeply composed', () => {
      class Person {
        mother = Person;
        father = Person;
        name = String;
      }

      let person, mapped, beforeTransition, afterTransition;
      beforeEach(() => {
        person = Microstate.create(Person, { name: 'Bart', mother: { name: 'Marge' } });
        beforeTransition = jest.fn();
        afterTransition = jest.fn();
        mapped = map(tree => tree.use(next => (microstate, transition, args) => {
          beforeTransition(microstate, transition, args);
          let result = next(microstate, transition, args);
          afterTransition(result);
          return result;
        }), person);
      });

      it('returns a microstate', () => {
        expect(mapped).toBeInstanceOf(Microstate);
      });

      describe('first transition', () => {
        let withFather;
        beforeEach(() => {
          withFather = mapped.father.set({ name: 'Homer' });
        });

        it('returns a microstate', () => {
          expect(withFather).toBeInstanceOf(Microstate);
        });

        it('has value', () => {
          expect(withFather.valueOf()).toEqual({ name: 'Bart', mother: { name: 'Marge' }, father: { name: 'Homer' } })
        });

        it('called the beforeTransition once', () => {
          expect(beforeTransition).toHaveBeenCalledTimes(1);
        });

        it('called afterTransition once', () => {
          expect(afterTransition).toHaveBeenCalledTimes(1);
        });

        it('captured before and after state', () => {
          expect(beforeTransition.mock.calls[0][0].state).toBeUndefined();
          expect(afterTransition.mock.calls[0][0].state).toMatchObject({
            name: 'Bart',
            mother: { name: 'Marge' },
            father: { name: 'Homer' }
          });
        });

        describe('second transition', () => {
          let fatherNameTree;
          beforeEach(() => {
            fatherNameTree = withFather.father.name.set('Senior Homer');
          });

          it('returns a microstate', () => {
            expect(fatherNameTree).toBeInstanceOf(Microstate);
          });

          it('has value', () => {
            expect(fatherNameTree.valueOf()).toEqual({ name: 'Bart', mother: { name: 'Marge' }, father: { name: 'Senior Homer' } })
          });

          it('called the beforeTransition once', () => {
            expect(beforeTransition).toHaveBeenCalledTimes(2);
          });

          it('called afterTransition once', () => {
            expect(afterTransition).toHaveBeenCalledTimes(2);
          });

          it('captured before and after state', () => {
            expect(beforeTransition.mock.calls[1][0].state).toEqual('Homer');
            expect(afterTransition.mock.calls[1][0].state).toMatchObject({
              name: 'Bart',
              mother: { name: 'Marge' },
              father: { name: 'Senior Homer' }
            });
          });
        });
      });

    });
  });

  describe('initialization', () => {
    describe('at root', () => {
      class Session {
        initialize(data = { token: null }) {
          if (data.token) {
            return Microstate.create(Authenticated, data);
          }
          return Microstate.create(Anonymous, data);
        }
      }
      class Authenticated extends Session {
        token = String;
        logout() {}
      }
      class Anonymous extends Session {
        signin() {}
      }
  
      describe('initialize without token', () => {
        let initialized;
        beforeEach(() => {
          initialized = Microstate.create(Session);
        });
  
        it('initilizes into another type', () => {
          expect(initialized.state).toBeInstanceOf(Anonymous);
        });
  
        it('has signin transition', () => {
          expect(initialized.signin).toBeInstanceOf(Function);
        });
  
        describe('calling initialize on initialized microstate', () => {
          let reinitialized;
          beforeEach(() => {
            reinitialized = initialized.initialize({ token: 'foo' });
          });
  
          it('initilizes into Authenticated', () => {
            expect(reinitialized.state).toBeInstanceOf(Authenticated);
          });
        });
      });
  
      describe('initialize with token', () => {
        let initialized;
        beforeEach(() => {
          initialized = Microstate.create(Session, { token: 'SECRET' });
        });
  
        it('initilizes into Authenticated', () => {
          expect(initialized.state).toBeInstanceOf(Authenticated);
        });
  
        it('has signin transition', () => {
          expect(initialized.logout).toBeInstanceOf(Function);
        });
      });
    });

    describe("deeply nested", () => {
      class Root {
        first = class First {
          second = class Second {
            name = String;
            initialize(props) {
              if (!props) {
                return Microstate.create(Second, { name: "default" });
              }
              return this;
            }
          };
        };
      }
    
      describe('initialization', () => {
        let root;
        
        beforeEach(() => {
          root = Microstate.create(Root, { first: { } });
        });

        it("has result of create of second node", () => {
          expect(root.state).toMatchObject({
            first: {
              second: {
                name: "default",
              },
            },
          });
        });

        describe('transition', () => {

          let changed;
          beforeEach(() => {
            changed = root.first.second.name.concat("!!!");
          });
        
          it("has result after transition valueOf", () => {
            expect(changed.valueOf()).toEqual({
              first: {
                second: {
                  name: "default!!!",
                },
              },
            });
          });
  
        });  
      });
    });
  });

  describe("State", () => {
    describe("recursive type", () => {
      class Person {
        father = Person;
        mother = Person;
        name = String;
      }

      describe("with data", () => {
        let person;
        beforeEach(() => {
          person = Microstate.create(Person, { name: 'Bart', mother: { name: 'Marge' }, father: { name: 'Homer' }});
        });
        it('root is instance of Person', () => {
          expect(person.state).toBeInstanceOf(Person);
        });
        it('root has primitive value', () => {
          expect(person.state.name).toBe('Bart');
        });
        it('composted types are instances of Person', () => {
          expect(person.state.mother).toBeInstanceOf(Person);
          expect(person.state.father).toBeInstanceOf(Person);
        });
        it('composted types have primivite values', () => {
          expect(person.state.mother.name).toBe('Marge');
          expect(person.state.father.name).toBe('Homer');
        });
      });
      describe("with partial data", () => {
        let person;
        beforeEach(() => {
          person = Microstate.create(Person, { name: 'Bart', mother: { } });
        });
        it('root is instance of Person', () => {
          expect(person.state).toBeInstanceOf(Person);
        });
        it('root has primitive value', () => {
          expect(person.state.name).toBe('Bart');
        });
        it('composted type with partial data is an instance', () => {
          expect(person.state.mother).toBeInstanceOf(Person);
        });
        it('composed type without data is undefined', () => {
          expect(person.state.father).toBeUndefined();          
        })
        it('composted types have primivite values', () => {
          expect(person.state.mother.name).toBe('');
        });
      });
      describe("without data", () => {
        let person;
        beforeEach(() => {
          person = Microstate.create(Person);
        });
        it('root is undefined', () => {
          expect(person.state).toBeUndefined()
        });
      });
    });

  });

});
