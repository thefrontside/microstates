import MicrostateObject from '../src/primitives/object';
import MicrostateBoolean from '../src/primitives/boolean';
import 'jest';
import * as getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

import microstates from '../src/microstates';
import MicrostateString from '../src/primitives/string';
import { isMicrostateAction } from '../src/constants';
import MicrostateNumber from '../src/primitives/number';
import MicrostateArray from '../src/primitives/array';

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

  describe('primitive values', () => {
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
      it(`it doesn't have set action`, () => {
        let { state } = microstates(State);
        expect(state.set).toBeUndefined();
      });
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

      describe('composed arrays', () => {
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

    describe('set', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(State);
      });
      it('composed state has set action', () => {
        expect(ms.actions.widget.set.isMicrostateAction).toEqual(isMicrostateAction);
      });
      describe('class matching', () => {
        describe('composed', () => {
          describe('shallow', () => {
            let ms;
            beforeEach(() => {
              ms = microstates(
                class Foo {
                  string = String;
                  number = Number;
                }
              );
            });
            it('does not throw on null', () => {
              expect(() => {
                ms.actions.set(null);
              }).not.toThrow();
            });
            it("throws an exception set doesn't match type", () => {
              expect(() => {
                ms.actions.set('');
              }).toThrowError(/set expected Foo, got String/);
              expect(() => {
                ms.actions.set(new MicrostateString('foo'));
              }).toThrowError(/set expected Foo, got MicrostateString/);
            });
          });
          describe('deep', () => {
            describe('nested in array', () => {
              let ms, newProducts, newState;
              beforeEach(() => {
                class Product {
                  name = String;
                  related = [Product];
                }
                class State {
                  products = [Product];
                }
                ms = microstates(State, { products: [{ name: 'foo' }, { name: 'bar' }] });
                newProducts = microstates([Product], [{ name: 'baz' }, { name: 'zoo' }]);
                newState = ms.actions.products.set(newProducts.state);
              });
              it('replaced existing products', () => {
                expect(newState.state.products).toEqual([
                  { name: 'baz', related: [] },
                  { name: 'zoo', related: [] },
                ]);
              });
            });
            describe('nested composed', () => {
              let ms, sub;
              beforeEach(() => {
                class Baz {
                  name = String;
                }
                class Foo {
                  name = String;
                  baz = Baz;
                }
                ms = microstates(
                  class State {
                    foo = Foo;
                  }
                );
                sub = microstates(Foo, { name: 'Foo', baz: { name: 'Baz' } });
              });
              it('does not throw when set correct state', () => {
                expect(() => {
                  ms.actions.foo.set(sub.state);
                }).not.toThrow();
              });
              it('returns new state', () => {
                let { state } = ms.actions.foo.set(sub.state);
                expect(state).toEqual({
                  foo: {
                    name: 'Foo',
                    baz: {
                      name: 'Baz',
                    },
                  },
                });
              });
            });
          });
        });
      });
    });

    describe('merge', () => {
      it(`is available on composed state's actions`, () => {
        let { state, actions } = microstates(class Foo {});
        expect(actions.merge).toBeDefined();
      });
      describe('merging composed state', () => {
        let initial, merged;
        beforeEach(() => {
          class Product {
            name = String;
          }
          class User {
            name = String;
          }
          class Session {
            token = String;
          }
          class Authentication {
            isAuthenticated = Boolean;
            session = Session;
          }
          class State {
            products = [Product];
            authentication = Authentication;
            currentUser = User;
          }
          initial = microstates(State, {
            currentUser: { name: 'Anonymous' },
            products: [{ name: 'MacBook' }],
          });
          let authentication = microstates(State, {
            authentication: { isAuthenticated: true, session: { token: 'ABC' } },
            currentUser: { name: 'Peter Griffin' },
          });
          merged = initial.actions.merge(authentication.state);
        });
        it('merges state', () => {
          expect(merged.state.products[0].name).toBe('MacBook');
          expect(merged.state.authentication.isAuthenticated).toBeTruthy();
          expect(merged.state.authentication.session.token).toBe('ABC');
          expect(merged.state.currentUser.name).toBe('Peter Griffin');
        });
      });
    });

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
