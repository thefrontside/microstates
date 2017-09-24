import 'jest';

import Transitions from '../../src/utils/transitions';
import Tree from '../../src/utils/tree';

describe('Transitions', () => {
  it('has map', () => {
    expect(Transitions.map).toBeDefined();
  });
  describe('node', () => {
    let transitions;
    beforeEach(() => {
      let callback = jest.fn();
      transitions = Transitions.map(callback, Tree.from(String));
    });
    it('is an instance of Transitions', () => {
      expect(transitions).toBeInstanceOf(Transitions);
    });
  });
  describe('callback', () => {
    let callback;
    beforeEach(() => {
      callback = jest.fn();
      Transitions.map(callback, Tree.from(String));
    });
    it('is not called until read', () => {
      expect(callback).toHaveBeenCalledTimes(0);
    });
    describe('caching', () => {
      beforeEach(() => {
        callback = jest.fn().mockImplementation(transition => (...args) => transition(...args));
        let transitions = Transitions.map(callback, Tree.from(String));
        transitions.concat('');
        transitions.concat('');
      });
      it('is called once', () => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      it('received function as first argument', () => {
        expect(typeof callback.mock.calls[0][0]).toBe('function');
      });
      it('received path which is empty array as second argument', () => {
        expect(callback.mock.calls[0][1]).toEqual([]);
      });
    });
  });
  describe('tree', () => {
    let callback;
    let interceptor;
    let transitions;
    let renamedStewie;
    let agedPeter;
    class Person {
      name = String;
      age = Number;
      parent = Person;
    }
    beforeEach(() => {
      let state = {
        name: 'Stewie',
        age: 1,
        parent: {
          name: 'Peter',
          age: 64,
        },
      };
      interceptor = jest.fn().mockImplementation(s => s);
      callback = jest.fn().mockImplementation(function(transition, path) {
        return (...args) => {
          return interceptor(transition(state, ...args));
        };
      });
      transitions = Transitions.map(callback, Tree.from(Person));
      renamedStewie = transitions.name.concat(' Griffin');
      agedPeter = transitions.parent.age.increment();
    });
    describe('callback', () => {
      it('was called twice', () => {
        expect(callback).toHaveBeenCalledTimes(2);
      });
      it('was called with path [name] first', () => {
        expect(callback.mock.calls[0][1]).toEqual(['name']);
      });
      it('was called with path [parent, age] second', () => {
        expect(callback.mock.calls[1][1]).toEqual(['parent', 'age']);
      });
    });
    it('returned values from transitions', () => {
      expect(renamedStewie).toEqual({
        name: 'Stewie Griffin',
        age: 1,
        parent: {
          name: 'Peter',
          age: 64,
        },
      });
      expect(agedPeter).toEqual({
        name: 'Stewie',
        age: 1,
        parent: {
          name: 'Peter',
          age: 65,
        },
      });
    });
    describe('interceptor', () => {
      it('was called twice', () => {
        expect(interceptor).toHaveBeenCalledTimes(2);
      });
      it('was called with both states', () => {
        expect(interceptor.mock.calls[0]).toEqual([
          {
            name: 'Stewie Griffin',
            age: 1,
            parent: {
              name: 'Peter',
              age: 64,
            },
          },
        ]);
        expect(interceptor.mock.calls[1]).toEqual([
          {
            name: 'Stewie',
            age: 1,
            parent: {
              name: 'Peter',
              age: 65,
            },
          },
        ]);
      });
    });
  });
  describe('parameterized', () => {
    let callback;
    let transitions;
    let shallowToggle;
    let deepToggle;
    class Todo {
      isCompleted = Boolean;
      tasks = [Todo];
    }
    class State {
      todos = [Todo];
    }
    let state = {
      todos: [{ isCompleted: true, tasks: [{ isCompleted: true }, { isCompleted: false }] }],
    };
    describe('deeply nested transition tree', () => {
      beforeEach(() => {
        callback = jest
          .fn()
          .mockImplementation((transition, path) => (...args) => transition(state, ...args));
        transitions = Transitions.map(callback, Tree.from(State));
        shallowToggle = transitions.todos[0].isCompleted.toggle();
        deepToggle = transitions.todos[0].tasks[1].isCompleted.toggle();
      });
      describe('tree', () => {
        it('has Transitions instances as nested nodes', () => {
          expect(transitions.todos).toBeInstanceOf(Transitions);
          expect(transitions.todos[0]).toBeInstanceOf(Transitions);
          expect(transitions.todos[0].tasks).toBeInstanceOf(Transitions);
        });
      });
      describe('callback', () => {
        it('was called twice', () => {
          expect(callback).toHaveBeenCalledTimes(2);
        });
      });
      describe('result', () => {
        it('transforms shallow toggle', () => {
          expect(shallowToggle).toEqual({
            todos: [{ isCompleted: false, tasks: [{ isCompleted: true }, { isCompleted: false }] }],
          });
        });
        it('transforms deep toggle', () => {
          expect(deepToggle).toEqual({
            todos: [{ isCompleted: true, tasks: [{ isCompleted: true }, { isCompleted: true }] }],
          });
        });
      });
    });
  });
});
