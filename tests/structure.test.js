import 'jest';
import { view, set } from '../src/lens';
import { analyze, Tree, parameterized } from 'microstates';
import types from '../src/types';

describe('Structure', () => {
  class Session {
    user = class User {
      firstName = String;
      lastName = String;

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
  let tree = analyze(Session, initialValue);

  it('can fetch the value at each node', function() {
    expect(tree.data.value).toBe(initialValue);
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

    let {tree: nextTree, value: nextValue} = tree.data.transitionsAt(tree, invoke).authenticate('username', 'password');
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

    let { tree: nextTree, value: nextValue } = tree.children.user.children.lastName.data.transitionsAt(tree, invoke).set('make super');

    expect(invoke.mock.calls.length).toBe(1);

    let { method, args, value: passedValue, tree: passedTree } = invoke.mock.calls[0][0];

    expect(method.name).toBe('setTransition');
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

  describe('A Parameterized Array', function() {
    let array;
    beforeEach(function() {
      array = [true, false, false];
      let Type = parameterized(Array, Boolean);
      tree = analyze(Type, array);
    });
    it('has a node for each member of the array', function() {
      expect(tree.children.length).toBe(3);
      expect(tree.children[0]).toBeDefined();
      expect(tree.children[1]).toBeDefined();
      expect(tree.children[2]).toBeDefined();
    });
    it('re-uses the value of the array as both its value and state', function() {
      expect(tree.data.value).toBe(array);
      expect(tree.data.state).toBe(array);
    });
    it('can invoke transitions on the subtypes', function() {
      let invoke = jest.fn(() => ({
        tree: analyze(Boolean, true),
        value: true
      }));
      let transitions = tree.children[2].data.transitionsAt(tree, invoke);

      let { tree: nextTree, value: nextValue } = transitions.toggle();
      expect(nextValue).toEqual([true, false, true]);
    });

    it('updates a tree to keep in sync with array transitions', function() {
      let invoke = jest.fn(() => ({
        tree: analyze(parameterized(Array, Boolean), [true, false]),
        value: [true, false]
      }));
      let transitions = tree.data.transitionsAt(tree, invoke);
      let { tree: nextTree, value: nextValue } = transitions.pop();
      expect(nextValue).toEqual([true, false]);
      expect(nextTree.children.length).toEqual(2);
      expect(nextTree.children[0].data.Type.name).toBe("BooleanType");
      expect(nextTree.children[1].data.Type.name).toBe("BooleanType");
    });
  });

  describe('An Unparameterized Array', function() {
    let array;
    beforeEach(function() {
      array = [1, 2, 3];
      tree = analyze(Array, array);
    });
    it('does not have child nodes for its children', function() {
      expect(tree.children.length).toBe(0);
    });
    it('re-uses the value as both its value and state', function() {
      expect(tree.data.value).toBe(array);
      expect(tree.data.state).toBe(array);
    });
  });

  describe('A Parameterized Object', function() {
    let object;
    beforeEach(function() {
      object = {one: 1, two: 2};
      let Type = parameterized(Object, Number);
      tree = analyze(Type, object);
    });
    it('has a node for each entry in the object', function() {
      expect(tree.children.one).toBeDefined();
      expect(tree.children.two).toBeDefined();
    });
    it('re-uses the value of the object as both its value and state', function() {
      expect(tree.data.value).toBe(object);
      expect(tree.data.state).toBe(object);
    });
    it('can invoke transitions on the subtypes', function() {
      let invoke = jest.fn(() => ({
        tree: analyze(Number, 2),
        value: 2
      }));
      let transitions = tree.children.one.data.transitionsAt(tree, invoke);

      let { tree: nextTree, value: nextValue } = transitions.increment();
      expect(nextValue).toEqual({one: 2, two: 2});
    });

    it('updates a tree to keep in sync with array transitions', function() {
      let invoke = jest.fn(() => ({
        tree: analyze(parameterized(Object, Number), {one: 1, two: 2, three: 3}),
        value: {one: 1, two: 2, three: 3}
      }));
      let transitions = tree.data.transitionsAt(tree, invoke);
      let { tree: nextTree, value: nextValue } = transitions.assign({three: 3});
      expect(nextValue).toEqual({one: 1, two: 2, three: 3});
      expect(nextTree.children.one.data.Type.name).toBe("NumberType");
      expect(nextTree.children.two.data.Type.name).toBe("NumberType");
      expect(nextTree.children.three.data.Type.name).toBe("NumberType");
    });
  });


});

import logTree from '../src/utils/log-tree';
