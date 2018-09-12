import expect from 'expect';

import { create } from '../src/microstates';

describe('initialization', () => {
  describe('at root', () => {
    class Session {
      initialize(data = { token: null }) {
        if (data.token) {
          return create(Authenticated, data);
        }
        return create(Anonymous, data);
      }
    }
    class Authenticated extends Session {
      token = create(class StringType {});
      logout() {}
    }
    class Anonymous extends Session {
      signin() {}
    }

    describe('initialize without token', () => {
      let initialized;
      beforeEach(() => {
        initialized = create(Session);
      });

      it('initilizes into another type', () => {
        expect(initialized).toBeInstanceOf(Anonymous);
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
          expect(reinitialized).toBeInstanceOf(Authenticated);
          expect(reinitialized.state).toEqual({ token: 'foo' });
        });
      });
    });

    describe('initialize with token', () => {
      let initialized;
      beforeEach(() => {
        initialized = create(Session, { token: 'SECRET' });
      });

      it('initilizes into Authenticated', () => {
        expect(initialized).toBeInstanceOf(Authenticated);
        expect(initialized.state).toEqual({ token: 'SECRET' });
      });

      it('has signin transition', () => {
        expect(initialized.logout).toBeInstanceOf(Function);
      });
    });
  });

  describe("deeply nested", () => {

    class Root {
      first = First;
    }

    class First {
      second = Second;
    }

    class Second {
      name = String;

      initialize(props) {
        if (!props) {
          return create(Second, { name: "default" });
        }
        return this;
      }
    }

    describe('initialization', () => {
      let root;

      beforeEach(() => {
        root = create(Root, { first: { } });
      });

      it('maintains the === integrity of the state tree', function() {
        expect(root.state).toBe(root.state);
        expect(root.first.state).toBe(root.state.first);
        expect(root.first.second.state).toBe(root.state.first.second);
        expect(root.first.second.name.state).toBe(root.state.first.second.name);
      });

      it("has result of create of second node", () => {
        expect(root.state).toEqual({
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
          expect(changed.state).toEqual({
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
})

import { Meta } from '../src/microstates'
