import 'jest';
import * as MS from '../src/index';
import Tree from '../src/utils/tree';
import { view, set } from '../src/lens';
import analyze from '../src/structure';

describe.only('Structure', () => {
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
  let value = { user: { firstName: 'Charles', lastName: 'Lowell' } };
  let tree = analyze(Session, value);

  it('can fetch the value at each node', function() {
    expect(tree.data.valueAt(value)).toMatchObject({
      user: {}
    });
    expect(tree.children.user.data.valueAt(value)).toMatchObject({
      firstName: 'Charles',
      lastName: 'Lowell'
    });
    expect(tree.children.user.children.firstName.data.valueAt(value)).toEqual('Charles');
  });

  // it('can fetch the state at each node', function() {
  //   expect(tree.data.stateAt(value)).toBeDefined();
  //   expect(tree.data.stateAt(value)).toBeInstanceOf(Session);
  //   expect(tree.children.user.data.stateAt(value).constructor.name).toEqual('User');
  //   expect(tree.children.user.children.firstName.data.stateAt(value)).toEqual('Charles');
  //   expect(tree.children.user.children.lastName.data.stateAt(value)).toEqual('Lowell');
  // });

  // it('can transition at a node', function () {
  //   let next = tree.data.transitions.authenticate();
  //   expect(next.data.value.isAuthenticated).toEqual(true);
  //   expect(next.data.state.isAuthenticated).toEqual(true);
  //   expect(tree.children.user.children.firstName.data.state).toEqual('Charles');
  //   expect(tree.children.user.children.lastName.data.state).toEqual('Lowell');
  // });
});
