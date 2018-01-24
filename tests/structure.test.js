import 'jest';
import * as MS from '../src/index';
import Tree from '../src/utils/tree';
import { view, set } from '../src/lens';
import structure from '../src/structure';

describe('Structure', () => {
  class Session {
    user = class User {
      firstName = MS.String;
      lastName = MS.String;

      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }

      get greeting() {
        return `Hello ${this.fullName}`;
      }
    };

    authenticate(current) {
      return {...current, isAuthenticated: true };
    }
  }
  let struct = structure(Session, { user: { firstName: 'Charles', lastName: 'Lowell' } });

  it('can fetch the value at each node', function() {
    expect(struct.tree.data.value).toMatchObject({
      user: {}
    });
    expect(struct.tree.children.user.data.value).toMatchObject({
      firstName: 'Charles',
      lastName: 'Lowell'
    });
    expect(struct.tree.children.user.children.firstName.data.value).toEqual('Charles');
  });

  it('can fetch the state at each node', function() {
    expect(struct.states.data.state).toBeDefined();
    expect(struct.states.data.state).toBeInstanceOf(Session);
    expect(struct.states.children.user.data.state.constructor.name).toEqual('User');
    expect(struct.states.children.user.data.state.fullName).toEqual('Charles Lowell');
    expect(struct.states.children.user.data.state.greeting).toEqual('Hello Charles Lowell');
  });

  it('can transition at a node', function () {
    let next = struct.transitions.data.transitions.authenticate();
    expect(next.tree.data.value.isAuthenticated).toEqual(true);
    expect(next.states.data.state.isAuthenticated).toEqual(true);
    expect(struct.states.children.user.data.state.fullName).toEqual('Charles Lowell');
    expect(struct.states.children.user.data.state.greeting).toEqual('Hello Charles Lowell');
  });
});
