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

    authenticate() {
      // test doesn't actually use the body of the function
    }
  }
  let initialValue = { user: { firstName: 'Charles', lastName: 'Lowell' } };
  let tree = analyze(Session);

  it('can fetch the value at each node', function() {
    expect(tree.data.valueAt(initialValue)).toMatchObject({
      user: {}
    });
    expect(tree.children.user.data.valueAt(initialValue)).toMatchObject({
      firstName: 'Charles',
      lastName: 'Lowell'
    });
    expect(tree.children.user.children.firstName.data.valueAt(initialValue)).toEqual('Charles');
  });

  it('can fetch the state at each node', function() {
    expect(tree.data.stateAt(initialValue)).toBeDefined();
    expect(tree.data.stateAt(initialValue)).toBeInstanceOf(Session);
    expect(tree.children.user.data.stateAt(initialValue).constructor.name).toEqual('User');
    expect(tree.children.user.children.firstName.data.stateAt(initialValue)).toEqual('Charles');
    expect(tree.children.user.children.lastName.data.stateAt(initialValue)).toEqual('Lowell');
  });

  it('can transition at the root node', function () {
    class Authenticated extends Session {
      deauthenticate() {}
    };

    let returnValue = {
      isAuthenticated: true,
      user: { firstName: 'Authentic Charles', lastName: 'Authentic Lowell'}
    };

    let tree = analyze(Authenticated, returnValue);

    let invoke = jest.fn(() => ({
      value: returnValue,
      tree
    }));

    let {tree: nextTree, value: nextValue} = tree.data.transitionsAt(initialValue, tree, invoke).authenticate('username', 'password');
    expect(invoke.mock.calls.length).toBe(1);

    // verify the arguments passed to the `invoke` callback.
    let { method, args, value, tree: passedTree } = invoke.mock.calls[0][0];
    expect(method).toBe(Session.prototype.authenticate);
    expect(args).toEqual(['username', 'password']);
    expect(value).toBe(value);
    expect(tree).toBe(tree);


    // it maintains the tree structure.
    expect(nextTree.data.Type).toBe(Authenticated);

    // it returns the new value
    expect(nextValue).toMatchObject({
      isAuthenticated: true,
      user: { firstName: 'Authentic Charles', lastName: 'Authentic Lowell'}
    });
  });

  it('can transition at child nodes', function() {
    class SuperString {}

    let invoke = jest.fn(() => ({
      tree: analyze(SuperString, 'Super-tastic!'),
      value: 'Super-tastic!'
    }));

    let { tree: nextTree, value: nextValue } = tree.children.user.children.lastName.data.transitionsAt(initialValue, tree, invoke).set('make super');

    expect(invoke.mock.calls.length).toBe(1);

    let { method, args, value: passedValue, tree: passedTree } = invoke.mock.calls[0][0];

    expect(method.name).toBe('set');
    expect(args).toEqual(['make super']);

    // passed tree and value are local to the transition
    expect(passedValue).toBe('Lowell');
    expect(passedTree.data.Type.name).toEqual('StringType');
    expect(passedTree.data.path).toEqual([]);

    // we type shift on the subchild.
    expect(nextTree.children.user.children.lastName.data.Type).toBe(SuperString);

    // we have a new global value based on the invocation.
    expect(nextValue).toMatchObject({
      user: { firstName: 'Charles', lastName: 'Super-tastic!'}
    });
  });
});
