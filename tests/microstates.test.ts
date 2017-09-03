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
      let ms;
      beforeEach(() => {
        ms = microstates(State, {
          string: 'abc',
          number: 10,
          boolean: true,
          array: ['a', 'b', 'c'],
          object: { hello: 'world' },
        });
      });

      it('uses initial value provided', () => {
        expect(ms.state).toEqual({
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
          class State {
            products = [Product];
          }
          let { state, transitions } = microstates(State, { products: [{ title: 'MacBook' }] });
          newState = transitions.products[0].title.concat(' Pro');
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

      // describe('support for computed properties', () => {
      //   class User {
      //     firstName = String;
      //     lastName = String;
      //     get fullName() {
      //       return `${this.firstName} ${this.lastName}`;
      //     }
      //   }
      //   class State {
      //     user = User;
      //   }

      //   let state, actions;
      //   beforeEach(() => {
      //     let ms = microstates(State, {
      //       user: { firstName: 'Peter', lastName: 'Griffin' },
      //     });
      //     state = ms.state;
      //     actions = ms.actions;
      //   });

      //   it('computed fullName', () => {
      //     expect(state.user.fullName).toBe('Peter Griffin');
      //   });

      //   it('recomputes on transition', () => {
      //     let newState = actions.user.lastName.concat(' Sir');
      //     expect(newState.user.fullName).toBe('Peter Griffin Sir');
      //     expect(state.user.fullName).toBe('Peter Griffin');
      //   });
      // });
    });

    describe('transitions', () => {
      let ms;
      beforeEach(() => {
        ms = microstates(State);
      });

      it('descends into composed states', () => {
        expect(typeof ms.transitions.authentication.isAuthenticated.toggle).toEqual('function');
        expect(typeof ms.transitions.authentication.session.token.concat).toEqual('function');
        expect(typeof ms.transitions.authentication.user.name.concat).toEqual('function');
        expect(typeof ms.transitions.authentication.user.age.increment).toEqual('function');
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
        expect(ms.transitions.widget.set).toBeDefined();
      });
      describe('class matching', () => {
        describe('composed', () => {
          describe('shallow', () => {
            class Foo {
              string = String;
              number = Number;
            }
            let ms;
            beforeEach(() => {
              ms = microstates(Foo);
            });
            it('sending null clears the current content', () => {
              expect(ms.transitions.set(null)).toEqual({ string: '', number: 0 });
            });
            it('receives {}', () => {
              expect(ms.transitions.set({})).toEqual({ string: '', number: 0 });
            });
          });
          describe('deep', () => {
            describe('nested in array', () => {
              let ms, newState;
              beforeEach(() => {
                class Product {
                  name = String;
                  related = [Product];
                }
                class State {
                  products = [Product];
                }
                ms = microstates(State, { products: [{ name: 'foo' }] });
                newState = ms.transitions.products.set([{ name: 'baz' }, { name: 'zoo' }]);
              });
              it('has two products', () => {
                expect(newState.products).toHaveProperty('length', 2);
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
                  ms.transitions.foo.set(sub.state);
                }).not.toThrow();
              });
              it('returns new state', () => {
                expect(ms.transitions.foo.set(sub.state)).toEqual({
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
        class Foo {}
        let ms = microstates(Foo);
        expect(ms.transitions.merge).toBeDefined();
      });
      describe('merging composed state', () => {
        let merged;
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
          let state = microstates(State, {
            currentUser: { name: 'Anonymous' },
            products: [{ name: 'MacBook' }],
          });
          merged = state.transitions.merge({
            authentication: { isAuthenticated: true, session: { token: 'ABC' } },
            currentUser: { name: 'Peter Griffin' },
          });
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
        expect(ms.transitions.counter.increment()).toEqual({
          counter: 1,
          widget: {
            name: '',
          },
        });
      });
    });

    // describe('observable', () => {
    //   let ms, msObservable, observable, subscribe, subscription;
    //   beforeEach(() => {
    //     ms = microstates(State, {});
    //     observable = {
    //       next: jest.fn(),
    //     };
    //     msObservable = Observable.from(ms);
    //     subscription = msObservable.subscribe(observable);
    //   });

    //   it('has Observable symbol', () => {
    //     expect(ms[symbolObservable]).toBeDefined();
    //   });

    //   it('returns a subscribe function', () => {
    //     expect(typeof msObservable.subscribe).toBe('function');
    //   });

    //   it('returns an unsubscribe function', () => {
    //     expect(typeof subscription.unsubscribe).toBe('function');
    //   });

    //   it('receives new state when action is called', () => {
    //     ms.actions.counter.increment();
    //     expect(observable.next.mock.calls.length).toBe(1);
    //     expect(observable.next.mock.calls[0][0]).toEqual({
    //       counter: 1,
    //       widget: { name: '' },
    //     });
    //   });

    //   it('transitions composed states', () => {
    //     ms.actions.widget.name.concat('Peter');
    //     expect(observable.next.mock.calls.length).toBe(1);
    //     expect(observable.next.mock.calls[0][0]).toEqual({
    //       counter: 0,
    //       widget: { name: 'Peter' },
    //     });
    //   });

    //   it('after unsubscribe nothing is emitted', () => {
    //     subscription.unsubscribe();
    //     ms.actions.counter.increment();
    //     expect(observable.next.mock.calls.length).toBe(0);
    //   });
    // });
  });
});
