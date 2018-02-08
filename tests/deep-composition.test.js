import 'jest';
import { map } from 'funcadelic';
import create from '../src';

class Session {
  token = String;
}
class Authentication {
  isAuthenticated = Boolean;
  session = Session;
}
class State {
  authentication = Authentication;
}
describe('without initial state', () => {
  let ms;
  beforeEach(() => {
    ms = create(State);
  });
  it('builds state tree', () => {
    expect(ms.state).toMatchObject({
      authentication: {
        session: {
          token: '',
        },
      },
    });
  });
  it('transitions deeply nested state', () => {
    expect(ms.authentication.session.token.set('SECRET').valueOf()).toEqual({
      authentication: {
        session: { token: 'SECRET' },
      },
    });
  });
});
describe('with initial state', () => {
  let ms;
  beforeEach(() => {
    ms = create(State, {
      authentication: { isAuthenticated: true, session: { token: 'SECRET' } },
    });
  });
  it('builds state tree', () => {
    expect(ms.state).toMatchObject({
      authentication: {
        isAuthenticated: true,
        session: {
          token: 'SECRET',
        },
      },
    });
  });
});