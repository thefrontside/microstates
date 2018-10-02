import expect from 'expect';

import { create } from '../src/microstates';
import { valueOf } from '../src/meta';

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
          expect(valueOf(reinitialized)).toEqual({ token: 'foo' });
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
        expect(valueOf(initialized)).toEqual({ token: 'SECRET' });
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

      describe('transition', () => {

        let changed;
        beforeEach(() => {
          changed = root.first.second.name.concat("!!!");
        });

        it("has result after transition valueOf", () => {
          expect(changed.first.second.name.state).toEqual("default!!!");
        });

      });
    });
  });
})
