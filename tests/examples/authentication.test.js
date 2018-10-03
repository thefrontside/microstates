import expect from 'expect';
import { create } from '../../src/microstates';

class AnonymousSession {
  content = create();

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
  isAuthenticated = create(Boolean, true);
  content = create(Object, {});

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
      expect(authenticated.session.state).toEqual({
        content: { name: 'Charles' }
      });
      expect(authenticated.session.isAuthenticated.state).toEqual(true);
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
