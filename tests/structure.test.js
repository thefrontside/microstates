import 'jest';
import * as MS from '../src/index';
import Tree from '../src/utils/tree';
import { view, set } from '../src/lens';
import Structure from '../src/structure';

describe('Structure', () => {
  class Session {
    user = class User {
      firstName = MS.String;
      lastName = MS.String;
    };
  }
  let struct = new Structure(Session, { user: { firstName: 'Charles', lastName: 'Lowell' } });
  it('has a type associated with the root node.', function() {
    expect(struct.types.data.Type).toBe(Session);
  });

  it('has a type associated with each dependent node', function() {
    expect(struct.types.children).toMatchObject({
      user: {
        children: {
          firstName: { data: { Type: MS.String } },
          lastName: { data: { Type: MS.String } },
        },
      },
    });
  });
  it('has the path for each node', function() {
    expect(struct.types).toMatchObject({
      data: { path: [] },
      children: {
        user: {
          data: { path: ['user'] },
          children: {
            firstName: { data: { path: ['user', 'firstName'] } },
            lastName: { data: { path: ['user', 'lastName'] } },
          },
        },
      },
    });
  });
  it('can fetch the value at each node', function() {
    expect(struct.values.data.value).toMatchObject({
      user: {},
    });
    expect(struct.values.children.user.data.value).toMatchObject({
      firstName: 'Charles',
      lastName: 'Lowell',
    });
    console.log('struct = ', struct);
    expect(struct.values.children.user.children.firstName.data.value).toEqual('Charles');
  });
});
