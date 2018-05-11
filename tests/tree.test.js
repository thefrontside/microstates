import 'jest';

import types from '../src/types';
import Tree, { Microstate, reveal } from '../src/tree';
import { flatMap, map, append } from 'funcadelic';
import view from 'ramda/src/view';
import set from 'ramda/src/set';
import over from 'ramda/src/over';

const { assign } = Object;

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

  let a, things, moreThings;
  class Thing {
    name = String;
    more = Things;
  }

  class Things {
    a = Thing;
    b = Thing;
  }

  beforeEach(() => {
    a = new Tree({ Type: String });
    things = new Tree({ Type: Things, value: { a: { name: 'A' }, b: { name: 'B' }} });
    moreThings = new Tree({ Type: Things, value: { a: { name: 'A', more: { a: { name: 'AA' } } }, b: { name: 'B' } } })
  });

  describe('Functor', () => {
    describe('no-op', () => {
      let mapped;
      beforeEach(() => {
        mapped = map(tree => tree, a);
      });
  
      it('returns an instance of Tree', () => {
        expect(mapped).toBeInstanceOf(Tree);
      });
  
      it('has same type as original', () => {
        expect(mapped.Type).toBe(a.Type);
      });
  
      it('has new meta object', () => {
        expect(mapped.meta).not.toBe(a.meta);
      });
  
      it('has same data because no-op operation', () => {
        expect(mapped.data).toBe(a.data);
      });
  
      it('it has same path', () => {
        expect(mapped.path).toBe(a.path);
      });  
    })

    describe('chanding path', () => {
      let mapped;

      beforeEach(() => {
        mapped = map(tree => tree.assign({ meta: { path: ['name' ] } }), a);
      });

      it('allows to map tree and change path', () => {
        expect(mapped.meta.path).toEqual(['name']);
      });

      it('does not change the data', () => {
        expect(mapped.data).toBe(a.data);
      });
    });

    describe('changing value', () => {
      describe('with a static value', () => {
        let mapped;
        beforeEach(() => {
          mapped = map(tree => tree.assign({
            data: {
              value: 'hello world'
            }
          }), a);
        });
  
        it('updates value', () => {
          expect(mapped.value).toBe('hello world');
        });

        it('updates state', () => {
          expect(mapped.state).toBe('hello world');
        });
      });

      describe('with function', () => {
        let mapped;
        beforeEach(() => {
          mapped = map(tree => tree.assign({
            data: {
              value: () => 'hello world'
            }
          }), a);
        });
  
        it('updates value', () => {
          expect(mapped.value).toBe('hello world');
        });

        it('updates state', () => {
          expect(mapped.state).toBe('hello world');
        });
      });
    });

    describe('mapping children', () => {
      describe('merging arbitrary data', () => {
        let mapped;
        beforeEach(() => {
          mapped = map(tree => tree.assign({ data: { stringPath: tree.meta.path.join() } }), moreThings);
        });
        it('applies callback to every node', () => {
          expect(mapped.data.stringPath).toBe('');
          expect(mapped.children.a.data.stringPath).toBe('a');
          expect(mapped.children.a.children.more.data.stringPath).toBe('a,more');
          expect(mapped.children.a.children.more.children.a.data.stringPath).toBe('a,more,a');
        });
        it('has stable children', () => {
          expect(mapped.children).toBe(mapped.children);
          expect(mapped.children.a.children).toBe(mapped.children.a.children);
          expect(mapped.children.a.children.more.children).toBe(mapped.children.a.children.more.children);
        });
        it('changes root for each', () => {
          expect(mapped.root).toBe(mapped);
          expect(mapped.children.a.root).toBe(mapped);
          expect(mapped.children.a.children.more.root).toBe(mapped);
        });
      });
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

    describe('no-op', () => {
      let flatMapped;
      beforeEach(() => {
        flatMapped = flatMap(tree => tree, a);
      });
      it('kept the type', () => {
        expect(flatMapped.Type).toBe(a.Type);
      });
      it('kept the value', () => {
        expect(flatMapped.value).toBe(a.value);
      });
      it('kept state stable', () => {
        expect(flatMapped.state).toBe(a.state);
      });
      it('is not same', () => {
        expect(flatMapped.is(a)).toBe(false);
      });
    });

    describe('changing type', () => {
      describe('on root', () => {
        let flatMapped;
        let value = { a: { name: 'AHHHH' }, b: { name: "BUAAHHH" } };
        beforeEach(() => {
          flatMapped = flatMap(tree => {
            if (tree.Type === Things) {
              return new Tree({ Type: Thangs, value });
            }
            return tree;
          }, things);
        });
        it('replaces everything', () => {
          expect(flatMapped.Type).toBe(Thangs);
        });
        it('uses new value', () => {
          expect(flatMapped.value).toEqual(value);
        });
        it('does not assume stability', () => {
          expect(flatMapped.data).not.toBe(things.data);
        });
        it('has root as self', () => {
          expect(flatMapped.root).toBe(flatMapped);
        });
        it('has stable children', () => {
          expect(flatMapped.children).toBe(flatMapped.children);
          expect(flatMapped.children.a.children).toBe(flatMapped.children.a.children);
          expect(flatMapped.children.a.children.name).toBe(flatMapped.children.a.children.name);
        });
      });

      describe('on composed tree without changing value', () => {
        let flatMapped;
        beforeEach(() => {
          flatMapped = flatMap(tree => {
            if (tree.Type === Thing) {
              return new Tree({ Type: Thang, value: () => tree.value })
            }
            return tree;
          }, things);
        });
        it('changed type on the composed tree', () => {
          expect(flatMapped.children.a.Type).toBe(Thang);
          expect(flatMapped.children.b.Type).toBe(Thang);
        });
        it('has thangs in state on children', () => {
          expect(flatMapped.children.a.state).toBeInstanceOf(Thang);
          expect(flatMapped.children.b.state).toBeInstanceOf(Thang);
        });
        it('has thangs in state on root', () => {
          expect(flatMapped.state.a).toBeInstanceOf(Thang);
          expect(flatMapped.state.b).toBeInstanceOf(Thang);
        });
      });

      describe('on composed tree with new value for all children', () => {
        let flatMapped;
        beforeEach(() => {
          flatMapped = flatMap(tree => {
            if (tree.meta.InitialType === String) {
              return tree.assign({
                data: {
                  value() {
                    return `${tree.value} !!!`;
                  }
                }
              });
            }
            return tree;
          }, things);
        });
        it('has new value', () => {
          expect(flatMapped.children.a.children.name.value).toBe('A !!!');
          expect(flatMapped.children.b.children.name.value).toBe('B !!!');
        });
        it('accumulates value in parent nodes', () => {
          expect(flatMapped.children.a.value).toEqual({ name: 'A !!!'});
          expect(flatMapped.children.b.value).toEqual({ name: 'B !!!'});
          expect(flatMapped.value).toEqual({ a: { name: 'A !!!' }, b: { name: 'B !!!' }});
        });
      });
    });

    describe('on composed tree with new value for some children', () => {
      let flatMapped;
      beforeEach(() => {
        flatMapped = flatMap(tree => {
          if (tree.value === 'A') {
            return tree.assign({
              data: {
                value() {
                  return 'A !!!';
                }
              }
            });
          }
          return tree;
        }, things);
      });
      it('has new value on changed node', () => {
        expect(flatMapped.children.a.children.name.value).toBe('A !!!');
      })
      it('updated parents of changed node', () => {
        expect(flatMapped.children.a.value).toEqual({ name: 'A !!!'});
        expect(flatMapped.value).toEqual({ a: { name: 'A !!!' }, b: { name: 'B' }});
      });
      it('trees in uneffected branches did not change their value', () => {
        expect(flatMapped.children.b.children.name.value).toBe(things.children.b.children.name.value);
        expect(flatMapped.children.b.value).toBe(things.children.b.value);
      });
      it('computed new state', () => {
        expect(flatMapped.state.a.name).toEqual('A !!!');
        expect(flatMapped.state.a).toEqual({ name: 'A !!!' });
      });
      it('changed state for effected children', () => {
        expect(flatMapped.state.a).not.toBe(things.state.a);
      });
      it('reused state from uneffected children', () => {
        expect(flatMapped.children.b.state).toBe(things.children.b.state);
        expect(flatMapped.state.b).toBe(things.state.b);
      });
    });

    describe('changing children', () => {
      class Thing {
        name = String;
      }
      class Normalized {
        things = { Thing }
      }

      describe('adding children', () => {
        let normalized;
        let flatMapped;
        beforeEach(() => {
          normalized = new Tree({ Type: Normalized, value: { things: { phone: { name: 'iPhone' }} }});
          flatMapped = flatMap(tree => {
            if (tree.is(normalized.children.things)) {
              return tree.assign({
                meta: {
                  children: () => assign({}, tree.children, {
                    car: new Tree({ Type: Thing, value: { name: 'Subaru' }, path: ['car'] })
                  })
                }
              });
            }
            return tree;
          }, normalized);
        });
        it('has one item', () => {
          expect(normalized.children.things.children.phone.value).toEqual({ name: 'iPhone' });
        });
        it('has the new item', () => {
          expect(flatMapped.children.things.children.car.value).toEqual({ name: 'Subaru' });
        });
        it('has root on new item', () => {
          expect(flatMapped.children.things.children.car.root).toBe(flatMapped);
        });
        it('has path on the new item', () => {
          expect(flatMapped.children.things.children.car.path).toEqual(['things', 'car']);
        });
        it('adds value to the root', () => {
          expect(flatMapped.value).toEqual({ things: { phone: { name: 'iPhone' }, car: { name: 'Subaru' }}});
        });
        it('previous item state is stable', () => {
          expect(flatMapped.children.things.children.phone.state).toBe(normalized.children.things.children.phone.state);
        });
        it('updates state on root', () => {
          expect(flatMapped.state.things.car).toBeInstanceOf(Thing);
        });
        it('state on root is stable', () => {
          expect(flatMapped.state.things.phone).toBe(normalized.state.things.phone);
        });
      })
    });

    describe('changing value', () => {
      class Thing {
        name = String;
      }
      class Box {
        things = [Thing]
      }

      let box;
      let flatMapped;
      describe('adding and updating on root element', () => {
        beforeEach(() => {
          let value = { things: [ { name: 'iPhone' }, { name: 'Subaru' } ] };
          box = new Tree({ Type: Box, value });
          flatMapped = flatMap(tree => {
            if (tree.is(box)) {
              return tree.assign({
                data: {
                  value() {
                    return { 
                      things: [
                        value.things[0],
                        { name: 'Subabaruru' },
                        { name: 'Bicycle' }
                      ]
                    }
                  }
                }
              });
            }
            return tree;
          }, box);
        });

        it('updated the value on child trees', () => {
          expect(flatMapped.children.things.value).toEqual([
            { name: 'iPhone' },
            { name: 'Subabaruru' },
            { name: 'Bicycle' }
          ]);
        });

        it('updated the value on the root', () => {
          expect(flatMapped.value).toEqual({ 
            things: [
              { name: 'iPhone' }, { name: 'Subabaruru' }, { name: 'Bicycle' }
            ]
          });
        });

        it('keeps state of unchanged item stable', () => {
          expect(flatMapped.state.things[0]).toBe(box.state.things[0]);
        });

        it('changed the state of the updated item', () => {
          expect(flatMapped.children.things.children[1].state).toEqual({ name: 'Subabaruru' });
          expect(flatMapped.state.things[1]).toEqual({ name: 'Subabaruru' });
        });

        it('added new item to the state', () => {
          expect(flatMapped.state.things[2]).toEqual({ name: 'Bicycle' });
        });

        it('has root on each node', () => {
          expect(flatMapped.children.things.children[2].root).toBe(flatMapped);
          expect(flatMapped.children.things.children[1].root).toBe(flatMapped);
          expect(flatMapped.children.things.children[0].root).toBe(flatMapped);          
          expect(flatMapped.children.things.root).toBe(flatMapped);                    
          expect(flatMapped.root).toBe(flatMapped);                    
        });

      });

      describe('removing from root element', () => {
        beforeEach(() => {
          let value = { things: [ { name: 'iPhone' }, { name: 'Subaru' } ] };
          box = new Tree({ Type: Box, value });
          flatMapped = flatMap(tree => {
            if (tree.is(box)) {
              return tree.assign({
                data: {
                  value() {
                    return { 
                      things: [
                        value.things[0]
                      ]
                    }
                  }
                }
              });
            }
            return tree;
          }, box);
        });

        it('has new value on root', () => {
          expect(flatMapped.value).toEqual({ 
            things: [
              { name: 'iPhone' }
            ]
          });
        });

        it('has stable state on unchanged node', () => {
          expect(flatMapped.state.things[0]).toBe(box.state.things[0]);
        });

        it('has only one element', () => {
          expect(flatMapped.state.things).toHaveLength(1);
        });

        it('references root node', () => {
          expect(flatMapped.children.things.children[0].root).toBe(flatMapped);
          expect(flatMapped.children.things.root).toBe(flatMapped);
          expect(flatMapped.root).toBe(flatMapped);
        });
      });
    });
  })

  describe('isEqual', () => {
    describe('shallow', () => {
      it('instance is equal to itself', () => {
        expect(a.isEqual(a)).toBe(true);
      });
  
      it('no-op map is equal to itself', () => {
        let mapped = map(tree => tree, a);
        expect(a.isEqual(mapped)).toBe(true);
        expect(mapped.isEqual(a)).toBe(true);
      });
  
      it('no-op flatMap is equal to itself', () => {
        let flatMapped = flatMap(tree => tree, a);
        expect(a.isEqual(flatMapped)).toBe(true);
        expect(flatMapped.isEqual(a)).toBe(true);
      });
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

    describe('tree', () => {
      let tree;
      beforeEach(() => {
        tree = reveal(person);
      });

      it('has tree that references itself', () => {
        expect(tree.root).toBe(tree);
      });

      it('has composed tree that references root', () => {
        expect(reveal(person.name).root).toBe(tree);
      });
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
      let withFather;
      beforeEach(() => {
        withFather = person.father.set({ name: 'Homer' });
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

      describe('tree', () => {
        let tree, motherTree, fatherNameTree;

        beforeEach(() => {
          tree = reveal(withFather);
          motherTree = reveal(withFather.mother);
          fatherNameTree = reveal(withFather.father.name);
        });

        it('has correct root on revealed tree', () => {
          expect(tree.root).toBe(tree);
        });
  
        it('has correct root on tree in unchanged branch', () => {
          expect(motherTree.root).toBe(tree);
        });
  
        it('has correct root on tree in modified branch', () => {
          expect(fatherNameTree.root).toBe(tree);
        });
      })

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
