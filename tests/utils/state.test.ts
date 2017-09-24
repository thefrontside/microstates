import 'jest';

import State from '../../src/utils/state';
import Tree from '../../src/utils/tree';

const describe_primitive = (Type, initial) => {
  describe(`${Type.name}`, () => {
    describe('callback', () => {
      let callback;
      beforeEach(() => {
        callback = jest.fn();
        State.map(callback, Tree.from(Type));
      });
      it('called callback once', () => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      it('received arguments', () => {
        expect(callback).toHaveBeenCalledWith(initial, []);
      });
    });
  });
};

describe('State', () => {
  it('has map', () => {
    expect(State.map).toBeDefined();
  });
  describe('map', () => {
    describe_primitive(Number, 0);
    describe_primitive(String, '');
    describe_primitive(Boolean, false);
    describe_primitive(Array, []);
    describe_primitive([], []);
    describe_primitive(Object, {});
    describe('composed', () => {
      describe('type', () => {
        class Todo {}
        describe('callback', () => {
          let callback;
          beforeEach(() => {
            callback = jest.fn();
            State.map(callback, Tree.from(Todo));
          });
          it('called callback once', () => {
            expect(callback).toHaveBeenCalledTimes(1);
          });
          it('recieved initial value which is instance of Todo', () => {
            expect(callback.mock.calls[0][0]).toBeInstanceOf(Todo);
          });
          it('recieved empty path as second argument', () => {
            expect(callback.mock.calls[0][1]).toEqual([]);
          });
        });
      });
      describe('shallow', () => {
        class Todo {
          isCompleted = Boolean;
        }
        describe('callback', () => {
          let callback;
          beforeEach(() => {
            callback = jest.fn();
            let state = State.map(callback, Tree.from(Todo));
            state.isCompleted;
          });
          it('was called twice', () => {
            expect(callback).toHaveBeenCalledTimes(2);
          });
          it('called with initial boolean state for isCompleted', () => {
            expect(callback).toHaveBeenLastCalledWith(false, ['isCompleted']);
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
        describe('callback', () => {
          let callback;
          beforeEach(() => {
            callback = jest.fn();
            let state = State.map(callback, Tree.from(Todo));
            state.owner.name;
          });
          it('was called thrice', () => {
            expect(callback).toHaveBeenCalledTimes(3);
          });
          it('was called with arguments', () => {
            expect(callback.mock.calls).toEqual([
              [{ owner: Person }, []],
              [{ name: String }, ['owner']],
              ['', ['owner', 'name']],
            ]);
          });
        });
        describe('result', () => {
          let state;
          beforeEach(() => {
            state = State.map(v => v, Tree.from(Todo));
            state.owner.name;
          });
          it('is empty', () => {
            expect(state).toEqual({ owner: { name: '' } });
          });
          it('has nodes as instances of classes', () => {
            expect(state).toBeInstanceOf(Todo);
            expect(state.owner).toBeInstanceOf(Person);
          });
        });
      });
      describe('parameterized', () => {
        class Todo {
          tasks = [Todo];
        }
        describe('callback', () => {
          let callback;
          beforeEach(() => {
            callback = jest.fn().mockImplementation(v => v);
            let state = State.map(callback, Tree.from(Todo));
            state.tasks[0].tasks[2];
          });
          it('was called five times', () => {
            expect(callback).toHaveBeenCalledTimes(5);
          });
          it('received path', () => {
            expect(callback.mock.calls[0][1]).toEqual([]);
            expect(callback.mock.calls[1][1]).toEqual(['tasks']);
            expect(callback.mock.calls[2][1]).toEqual(['tasks', 0]);
            expect(callback.mock.calls[3][1]).toEqual(['tasks', 0, 'tasks']);
            expect(callback.mock.calls[4][1]).toEqual(['tasks', 0, 'tasks', 2]);
          });
        });
        describe('caching', () => {
          let callback;
          beforeEach(() => {
            callback = jest.fn().mockImplementation(v => v);
            let state = State.map(callback, Tree.from(Todo));
            state.tasks[0].tasks[2];
            state.tasks[0].tasks;
            state.tasks[1];
          });
          it('was called six times', () => {
            expect(callback).toHaveBeenCalledTimes(6);
          });
        });
      });
    });
  });
});
