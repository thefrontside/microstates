import expect from 'expect';
import { create } from '../../src/picostates';

import { ObjectType, ArrayType, BooleanType, Any } from '../../src/types';

class AnonymousSession {
  content = create(Any);

  initialize(session) {
    if (session) {
      return this.authenticate(session);
    }
    return this;
  }
  authenticate(user) {
    return create(AuthenticatedSession, { content: user });
  }
}

class AuthenticatedSession {
  isAuthenticated = create(BooleanType, true);
  content = create(ObjectType, {});

  logout() {
    return create(AnonymousSession);
  }
}

class MyApp {
  session = create(AnonymousSession);
}

describe('AnonymousSession', () => {
  let ms;
  beforeEach(() => {
    ms = create(MyApp);
  })
  it('initializes into AnonymousSession without initial state', () => {
    expect(ms.session).toBeInstanceOf(AnonymousSession);
  });
  describe('transition', () => {
    let authenticated;
    beforeEach(() => {
      authenticated = ms.session.authenticate({
        name: 'Charles',
      });
    });
    it('transitions AnonymousSession to Authenticated with authenticate', () => {
      expect(authenticated.session).toBeInstanceOf(AuthenticatedSession);
      expect(authenticated.state.session).toEqual({
        content: { name: 'Charles' },
        isAuthenticated: true,
      });
    });
  });
});

describe('AuthenticatedSession', () => {
  let ms, anonymous;
  beforeEach(() => {
    ms = create(MyApp, { session: { name: 'Taras', isAuthenticated: true } })
    anonymous = ms.session.logout();
  });
  it('initializes into AuthenticatedSession state', () => {
    expect(ms.session).toBeInstanceOf(AuthenticatedSession);
  });
  it('transitions Authenticated session to AnonymousSession with logout', () => {
    expect(anonymous.session).toBeInstanceOf(AnonymousSession);
  });
});
