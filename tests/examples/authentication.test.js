import 'jest';
import { create } from 'microstates';

class Session {
  content = null;
  constructor(state) {
    if (state) {
      return create(AuthenticatedSession, state);
    } else {
      return create(AnonymousSession, state);
    }
  }
}

class AuthenticatedSession {
  isAuthenticated = true;
  content = Object;

  logout() {
    return create(AnonymousSession);
  }
}

class AnonymousSession {
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
  let ms, authenticated;
  beforeEach(() => {
    ms = create(MyApp);
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