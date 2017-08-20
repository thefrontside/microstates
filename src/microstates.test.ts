import MicrostateString from './primitives/string';
import 'jest';

import microstates from './microstates';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

describe('microstates', () => {
  describe('arguments', () => {
    it('expects first argument to be a class', () => {
      expect(() => {
        microstates('Something');
      }).toThrowError(
        /microstates\(\) expects first argument to be a class, instead received string/
      );
    });
  });
  describe('primitives', () => {
    class State {
      string = String;
      number = Number;
      boolean = Boolean;
      array = Array;
      object = Object;
    }

    describe('state', () => {
      let { state } = microstates(State);
      describe('string', () => {
        it('is a string', () => {
          expect(typeof state.string).toEqual('string');
        });
        it('is empty', () => {
          expect(state.string).toBe('');
        });
      });
      describe('number', () => {
        it('is a number', () => {
          expect(typeof state.number).toEqual('number');
        });
        it('is zero', () => {
          expect(state.number).toBe(0);
        });
      });
      describe('boolean', () => {
        it('is a boolean', () => {
          expect(typeof state.boolean).toEqual('boolean');
        });
        it('is false', () => {
          expect(state.boolean).toBe(false);
        });
      });
      describe('array', () => {
        it('is a array', () => {
          expect(Array.isArray(state.array)).toBeTruthy();
        });
        it('is empty', () => {
          expect(state.array).toEqual([]);
        });
      });
      describe('object', () => {
        it('is a object', () => {
          expect(typeof state.object).toEqual('object');
        });
        it('is empty', () => {
          expect(state.object).toEqual({});
        });
      });
    });

    describe('initial', () => {
      let { state } = microstates(State, {
        string: 'abc',
        number: 10,
        boolean: true,
        array: ['a', 'b', 'c'],
        object: { hello: 'world' },
      });
      it('uses initial value provided', () => {
        expect(state).toEqual({
          string: 'abc',
          number: 10,
          boolean: true,
          array: ['a', 'b', 'c'],
          object: { hello: 'world' },
        });
      });
    });

    describe('actions', () => {
      let { actions } = microstates(State);
      describe('string', () => {
        it('is an object', () => {
          expect(actions.string).toBeInstanceOf(Object);
        });
        it('has concat', () => {
          expect(typeof actions.string.concat).toEqual('function');
        });
      });
      describe('number', () => {
        it('is an object', () => {
          expect(actions.number).toBeInstanceOf(Object);
        });
        it('has increment', () => {
          expect(typeof actions.number.increment).toEqual('function');
        });
        it('has decrement', () => {
          expect(typeof actions.number.decrement).toEqual('function');
        });
        it('has sum', () => {
          expect(typeof actions.number.sum).toEqual('function');
        });
        it('has subtract', () => {
          expect(typeof actions.number.subtract).toEqual('function');
        });
      });
      describe('boolean', () => {
        it('is an object', () => {
          expect(actions.boolean).toBeInstanceOf(Object);
        });
        it('has toggle', () => {
          expect(typeof actions.boolean.toggle).toEqual('function');
        });
      });
      describe('object', () => {
        it('is an object', () => {
          expect(actions.object).toBeInstanceOf(Object);
        });
        it('has assign', () => {
          expect(typeof actions.object.assign).toEqual('function');
        });
      });
      describe('array', () => {
        it('is an array', () => {
          expect(actions.array).toBeInstanceOf(Object);
        });
        it('has push', () => {
          expect(typeof actions.array.push).toEqual('function');
        });
      });
    });
  });
  describe('composition', () => {
    class Session {
      token = String;
    }
    class User {
      name = String;
      age = Number;
    }
    class Authentication {
      session = Session;
      user = User;
      isAuthenticated = Boolean;
    }
    class State {
      authentication = Authentication;
    }
    describe('state', () => {
      it('decends into composed states', () => {
        let { state } = microstates(State);
        expect(state).toEqual({
          authentication: {
            session: {
              token: '',
            },
            user: {
              name: '',
              age: 0,
            },
            isAuthenticated: false,
          },
        });
      });
      it('composted states are instances of their class', () => {
        let { state } = microstates(State);
        expect(state.authentication).toBeInstanceOf(Authentication);
        expect(state.authentication.session).toBeInstanceOf(Session);
        expect(state.authentication.user).toBeInstanceOf(User);
      });
      it('restores state', () => {
        let { state } = microstates(State, {
          authentication: {
            isAuthenticated: true,
            session: {
              token: 'VERY SECRET',
            },
            user: {
              name: 'Peter Griffin',
              age: 62,
            },
          },
        });
        expect(state).toEqual({
          authentication: {
            isAuthenticated: true,
            session: {
              token: 'VERY SECRET',
            },
            user: {
              name: 'Peter Griffin',
              age: 62,
            },
          },
        });
      });
      describe('support for computed properties', () => {
        class User {
          firstName = String;
          lastName = String;
          get fullName() {
            return `${this.firstName} ${this.lastName}`;
          }
        }
        class State {
          user = User;
        }
        let { state, actions } = microstates(State, {
          user: { firstName: 'Peter', lastName: 'Griffin' },
        });
        it('computed fullName', () => {
          expect(state.user.fullName).toBe('Peter Griffin');
        });
        it('recomputes on transition', () => {
          let { state: newState } = actions.user.lastName.concat(' Sir');
          expect(newState.user.fullName).toBe('Peter Griffin Sir');
          expect(state.user.fullName).toBe('Peter Griffin');
        });
      });
    });
    describe('actions', () => {
      let { actions } = microstates(State);
      it('descends into composed states', () => {
        expect(typeof actions.authentication.isAuthenticated.toggle).toEqual('function');
        expect(typeof actions.authentication.session.token.concat).toEqual('function');
        expect(typeof actions.authentication.user.name.concat).toEqual('function');
        expect(typeof actions.authentication.user.age.increment).toEqual('function');
      });
    });
  });
  describe('transitions', () => {
    class Widget {
      name = String;
    }
    class State {
      counter = Number;
      widget = Widget;
    }
    describe('in place', () => {
      let state, actions;
      beforeEach(() => {
        let ms = microstates(State, {});
        actions = ms.actions;
        state = ms.state;
      });
      it('returns a new state and actions', () => {
        let result = actions.counter.increment();
        expect(result.state).toEqual({
          counter: 1,
          widget: {
            name: '',
          },
        });
      });
    });
    describe('observable', () => {
      let actions, subscribe, observable, unsubscribe;
      beforeEach(() => {
        let ms = microstates(State, {});
        actions = ms.actions;
        subscribe = ms.subscribe;
        observable = {
          next: jest.fn(),
        };
        unsubscribe = subscribe(observable).unsubscribe;
      });
      it('returns a subscribe function', () => {
        expect(typeof subscribe).toBe('function');
      });
      it('returns an unsubscribe function', () => {
        expect(typeof unsubscribe).toBe('function');
      });
      it('receives new state when action is called', () => {
        actions.counter.increment();
        expect(observable.next.mock.calls.length).toBe(1);
        expect(observable.next.mock.calls[0][0].state).toEqual({
          counter: 1,
          widget: { name: '' },
        });
      });
      it('transitions composed states', () => {
        actions.widget.name.concat('Peter');
        expect(observable.next.mock.calls.length).toBe(1);
        expect(observable.next.mock.calls[0][0].state).toEqual({
          counter: 0,
          widget: { name: 'Peter' },
        });
      });
      it('after unsubscribe nothing is emitted', () => {
        unsubscribe();
        actions.counter.increment();
        expect(observable.next.mock.calls.length).toBe(0);
      });
    });
  });
});
