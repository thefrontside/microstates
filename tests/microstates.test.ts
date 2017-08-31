import 'jest';
import symbolObservable from 'symbol-observable';
import { Observable } from 'rxjs';
import microstates from '../src/microstates';
import MicrostateString from '../src/primitives/string';
import { isMicrostateAction } from '../src/constants';

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
          newState = actions.products[0].title.concat(' Pro');
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
          let newState = actions.user.lastName.concat(' Sir');
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
            it('sending null clears the current content', () => {
              expect(ms.actions.set(null)).toEqual({ string: '', number: 0 });
            });
            it('receives {}', () => {
              expect(ms.actions.set({})).toEqual({ string: '', number: 0 });
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
                newState = ms.actions.products.set([{ name: 'baz' }, { name: 'zoo' }]);
              });
              it('replaced existing products', () => {
                expect(newState.products).toEqual([
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
                expect(ms.actions.foo.set(sub.state)).toEqual({
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
          expect(merged.products[0].name).toBe('MacBook');
          expect(merged.authentication.isAuthenticated).toBeTruthy();
          expect(merged.authentication.session.token).toBe('ABC');
          expect(merged.currentUser.name).toBe('Peter Griffin');
        });
      });
    });

    describe('in place', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(State, {});
      });

      it('returns a new state', () => {
        expect(ms.actions.counter.increment()).toEqual({
          counter: 1,
          widget: {
            name: '',
          },
        });
      });
    });

    describe('observable', () => {
      let ms, msObservable, observable, subscribe, subscription;
      beforeEach(() => {
        ms = microstates(State, {});
        observable = {
          next: jest.fn(),
        };
        msObservable = Observable.from(ms);
        subscription = msObservable.subscribe(observable);
      });

      it('has Observable symbol', () => {
        expect(ms[symbolObservable]).toBeDefined();
      });

      it('returns a subscribe function', () => {
        expect(typeof msObservable.subscribe).toBe('function');
      });

      it('returns an unsubscribe function', () => {
        expect(typeof subscription.unsubscribe).toBe('function');
      });

      it('receives new state when action is called', () => {
        ms.actions.counter.increment();
        expect(observable.next.mock.calls.length).toBe(1);
        expect(observable.next.mock.calls[0][0]).toEqual({
          counter: 1,
          widget: { name: '' },
        });
      });

      it('transitions composed states', () => {
        ms.actions.widget.name.concat('Peter');
        expect(observable.next.mock.calls.length).toBe(1);
        expect(observable.next.mock.calls[0][0]).toEqual({
          counter: 0,
          widget: { name: 'Peter' },
        });
      });

      it('after unsubscribe nothing is emitted', () => {
        subscription.unsubscribe();
        ms.actions.counter.increment();
        expect(observable.next.mock.calls.length).toBe(0);
      });
    });
  });
});
