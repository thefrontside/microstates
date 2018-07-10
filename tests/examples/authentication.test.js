import expect from 'expect';
import { create } from '../../src/picostates';

import { ObjectType, ArrayType, BooleanType, Any } from '../../src/types';

// class Session {
//   content = create(Any);
//   initialize(session) {
//     if (session) {
//       return create(AuthenticatedSession, session);
//     }
//     return create(AnonymousSession, {});
//   }
// }

class AuthenticatedSession {
  isAuthenticated = create(BooleanType, true);
  content = create(ObjectType, {});

  initialize(session) {
    return session ? this : create(AnonymousSession);
  }

  logout() {
    return create(AnonymousSession, {});
  }
}

class AnonymousSession {
  content = create(Any);
  isAuthenticated = create(BooleanType, false);

  initialize(session) {
    return session && session.isAuthenticated ? create(AuthenticatedSession, session) : this;
  }

  authenticate(user) {
    return create(AuthenticatedSession, { content: user });
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
