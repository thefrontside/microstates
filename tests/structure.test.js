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

      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }

      get greeting() {
        return `Hello ${this.fullName}`;
      }
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
    expect(struct.values.children.user.children.firstName.data.value).toEqual('Charles');
  });

  it('can fetch the state at each node', function() {
    expect(struct.states.data.state).toBeDefined();
    expect(struct.states.data.state).toBeInstanceOf(Session);
    expect(struct.states.children.user.data.state.constructor.name).toEqual('User');
    expect(struct.states.children.user.data.state.fullName).toEqual('Charles Lowell');
    expect(struct.states.children.user.data.state.greeting).toEqual('Hello Charles Lowell');
  });
});
