import 'jest';
import { map } from 'funcadelic';
import Microstate from '../../src';

class Session {
  content = null;
  constructor(state) {
    if (state) {
      return new AuthenticatedSession(state);
    } else {
      return new AnonymousSession(state);
    }
  }
}

class AuthenticatedSession {
  isAuthenticated = true;
  content = Object;

  logout() {
    return this.set(AnonymousSession);
  }
}

class AnonymousSession {
  content = null;
  isAuthenticated = false;
  authenticate(current, user) {
    return this.set(AuthenticatedSession, { content: user });
  }
}

class MyApp {
  session = Session;
}

describe('AnonymousSession', () => {
  let ms, authenticated;
  beforeEach(() => {
    ms = Microstate.create(MyApp);
    authenticated = ms.session.authenticate({
      name: 'Charles',
    });
  })
  it('initializes into AnonymousSession without initial state', () => {
    expect(ms.state.session).toBeInstanceOf(AnonymousSession);
  });
  it('transitions AnonymousSession to Authenticated with authenticate', () => {
    expect(authenticated.state.session).toBeInstanceOf(AuthenticatedSession);
    expect(authenticated.state.session).toEqual({
      content: { name: 'Charles' },
      isAuthenticated: true,
    });
  });
});

describe('AuthenticatedSession', () => {
  let ms, anonymous;
  beforeEach(() => {
    ms = Microstate.create(MyApp, { session: { name: 'Taras' } })
    anonymous = ms.session.logout();
  });
  it('initializes into AuthenticatedSession state', () => {
    expect(ms.state.session).toBeInstanceOf(AuthenticatedSession);
  });
  it('transitions Authenticated session to AnonymousSession with logout', () => {
    expect(anonymous.state.session).toBeInstanceOf(AnonymousSession);
  });
});