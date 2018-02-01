import 'jest';
import * as MS from '../src/index';
import Tree from '../src/utils/tree';
import { view, set } from '../src/lens';
import analyze from '../src/structure';

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
  let tree = analyze(Session, { user: { firstName: 'Charles', lastName: 'Lowell' } });

  it('can fetch the value at each node', function() {
    expect(tree.data.value).toMatchObject({
      user: {}
    });
    expect(tree.children.user.data.value).toMatchObject({
      firstName: 'Charles',
      lastName: 'Lowell'
    });
    expect(tree.children.user.children.firstName.data.value).toEqual('Charles');
  });

  it('can fetch the state at each node', function() {
    expect(tree.data.state).toBeDefined();
    expect(tree.data.state).toBeInstanceOf(Session);
    expect(tree.children.user.data.state.constructor.name).toEqual('User');
    expect(tree.children.user.children.firstName.data.state).toEqual('Charles');
    expect(tree.children.user.children.lastName.data.state).toEqual('Lowell');
  });

  it('can transition at a node', function () {
    let next = tree.data.transitions.authenticate();
    expect(next.data.value.isAuthenticated).toEqual(true);
    expect(next.data.state.isAuthenticated).toEqual(true);
    expect(tree.children.user.children.firstName.data.state).toEqual('Charles');
    expect(tree.children.user.children.lastName.data.state).toEqual('Lowell');
  });
});
