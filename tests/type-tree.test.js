import 'jest';
import * as MS from '../src/index';
import Tree from '../src/utils/tree';
import { view, set } from '../src/lens';
import { toTypeTree } from '../src/structure';

describe('constructing the type tree', () => {
  class Session {
    user = class User {
      firstName = MS.String;
      lastName = MS.String;
    };
  }
  let tree = null;
  beforeEach(() => {
    tree = toTypeTree(Session);
  });
  it('has a type associated with the root node.', function() {
    expect(tree.data.Type).toBe(Session);
  });

  it('has a type associated with each dependent node', function() {
    expect(tree.children).toMatchObject({
      user: {
        children: {
          firstName: { data: { Type: MS.String } },
          lastName: { data: { Type: MS.String } },
        },
      },
    });
  });
  describe('the lens associated with each node', function() {
    let userLens, lastNameLens;

    beforeEach(function() {
      userLens = tree.children.user.data.lens;
      lastNameLens = tree.children.user.children.lastName.data.lens;
    });
    it('can read and write a singly nested lens', function() {
      expect(view(userLens, { user: 'Hi I am a user' })).toBe('Hi I am a user');
      expect(set(userLens, 'Good Bye', { user: 'Hello' })).toEqual({
        user: 'Good Bye',
      });
    });
    it('can read and write a deeply nested lens', function() {
      expect(view(lastNameLens, { user: { firstName: 'Phil', lastName: 'Lhotak' } })).toBe(
        'Lhotak'
      );
      expect(
        set(lastNameLens, 'Lowell', { user: { firstName: 'Phil', lastName: 'Lowell' } })
      ).toEqual({
        user: {
          firstName: 'Phil',
          lastName: 'Lowell',
        },
      });
    });
  });
});
