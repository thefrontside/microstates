import 'jest';

import State from '../../src/utils/state';
import Tree from '../../src/utils/tree';

const describe_primitive = (Type, initial, state) => {
  describe(`${Type.name}`, () => {
    let tree = Tree.from(Type);
    describe('initial', () => {
      it('initializes', () => {
        expect(State.from(tree)).toEqual(initial);
      });
    });
    describe('from state', () => {
      it('uses value', () => {
        expect(State.from(tree, state)).toEqual(state);
      });
    });
  });
};

describe('State', () => {
  it('has map', () => {
    expect(State.map).toBeDefined();
  });
  describe('map', () => {
    describe_primitive(Number, 0, 5);
    describe_primitive(String, '', 'foo');
    describe_primitive(Boolean, false, true);
    describe_primitive(Array, [], ['foo']);
    describe_primitive(Object, {}, { foo: 'bar' });
    describe('composed', () => {
      describe('type', () => {
        class Todo {}
        let tree = Tree.from(Todo);
        describe('initial', () => {
          let state = State.from(tree);
          it('is instance of Todo', () => {
            expect(state).toBeInstanceOf(Todo);
          });
          it('initializes', () => {
            expect(state).toEqual({});
          });
        });
        describe('from state', () => {
          let state = State.from(tree, { foo: 'bar' });
          it('is instance of Todo', () => {
            expect(state).toBeInstanceOf(Todo);
          });
          it('restores value', () => {
            expect(state).toEqual({});
          });
        });
      });
      describe('shallow', () => {
        class Todo {
          isCompleted = Boolean;
        }
        let tree = Tree.from(Todo);
        describe('initial', () => {
          let state = State.from(tree);
          it('is instance of Todo', () => {
            expect(state).toBeInstanceOf(Todo);
          });
          it('initializes', () => {
            expect(state).toEqual({ isCompleted: false });
          });
        });
        describe('from state', () => {
          let initial = { isCompleted: true };
          let state = State.from(tree, initial);
          it('is instance of Todo', () => {
            expect(state).toBeInstanceOf(Todo);
          });
          it('restores value', () => {
            expect(state).toEqual({ isCompleted: true });
          });
        });
      });
      describe('deep', () => {
        class Person {
          name = String;
        }
        class Todo {
          owner = Person;
        }
        let tree = Tree.from(Todo);
        describe('initial', () => {
          let state = State.from(tree);
          it('has nodes as instances', () => {
            expect(state).toBeInstanceOf(Todo);
            expect(state.owner).toBeInstanceOf(Person);
          });
          it('initializes', () => {
            expect(state).toEqual({ owner: { name: '' } });
          });
        });
        describe('from state', () => {
          let state = State.from(tree, { owner: { name: 'peter' } });
          it('has nodes as instances', () => {
            expect(state).toBeInstanceOf(Todo);
            expect(state.owner).toBeInstanceOf(Person);
          });
          it('restores value', () => {
            expect(state).toEqual({ owner: { name: 'peter' } });
          });
        });
      });
    });
  });
});

/**
 * jest uses pretty-format library which incorrectly interprets
 * state objects as Immutable.js objects and attempts to use immutable.js
 * apis on these objects. 
 * 
 * This function serializes state objects to object hashes and compares them
 * without any immutable.js baggage.
 */
function simplify(value) {
  return JSON.parse(JSON.stringify(value));
}
