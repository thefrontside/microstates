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

    describe('initial', () => {
      let state;
      beforeEach(() => {
        let ms = microstates(State, {
          string: 'abc',
          number: 10,
          boolean: true,
          array: ['a', 'b', 'c'],
          object: { hello: 'world' },
        });
        state = ms.state;
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
  });

  describe('actions', () => {
    it('do not change between transitions', () => {
      // TODO(taras): add this test back;
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

      describe.only('composed arrays', () => {
        let newState;
        beforeEach(() => {
          class Product {
            title = String;
          }
          let { state, actions } = microstates(
            class {
              products = [Product];
            },
            { products: [{ title: 'MacBook' }] }
          );
          newState = actions.products[0].title.concat(' Pro').state;
        });
        it('transitions array', () => {
          expect(newState.products[0].title).toEqual('MacBook Pro');
        });
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

        let state, actions;
        beforeEach(() => {
          let ms = microstates(State, {
            user: { firstName: 'Peter', lastName: 'Griffin' },
          });
          state = ms.state;
          actions = ms.actions;
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
      let actions;

      beforeEach(() => {
        let ms = microstates(State);
        actions = ms.actions;
      });

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
