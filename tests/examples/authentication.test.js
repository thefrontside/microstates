import 'jest';
import { create, reveal } from 'microstates';
import logTree from '../../src/utils/log-tree';

class Session {
  content = null;
  initialize(session) {
    if (session) {
      return create(AuthenticatedSession, session);
    }
    return create(AnonymousSession);
  }
}

class AuthenticatedSession extends Session {
  isAuthenticated = true;
  content = Object;

  logout() {
    return create(AnonymousSession);
  }
}

class AnonymousSession extends Session {
  content = null;
  isAuthenticated = false;

  authenticate(user) {
    return create(AuthenticatedSession, { content: user });
  }
}

class MyApp {
  session = Session;
}

describe('AnonymousSession', () => {
  let ms;
  beforeEach(() => {
    ms = create(MyApp);
  })
  it('initializes into AnonymousSession without initial state', () => {
    expect(ms.state.session).toBeInstanceOf(AnonymousSession);
  });
  describe('transition', () => {
    let authenticated;
    beforeEach(() => {
      authenticated = ms.session.authenticate({
        name: 'Charles',
      });
    });
    it('transitions AnonymousSession to Authenticated with authenticate', () => {
      expect(authenticated.state.session).toBeInstanceOf(AuthenticatedSession);
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
    ms = create(MyApp, { session: { name: 'Taras' } })
    anonymous = ms.session.logout();
  });
  it('initializes into AuthenticatedSession state', () => {
    expect(ms.state.session).toBeInstanceOf(AuthenticatedSession);
  });
  it('transitions Authenticated session to AnonymousSession with logout', () => {
    expect(anonymous.state.session).toBeInstanceOf(AnonymousSession);
  });
});
