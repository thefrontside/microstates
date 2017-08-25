import 'jest';

import ComputedProperty from './ComputedProperty';
import defineComputedProperty from './defineComputedProperty';

describe('defineComputedProperty', () => {
  interface MayHaveName {
    name?: string;
  }
  let object = {};
  let callback = jest.fn().mockReturnValue('taras');
  defineComputedProperty(object, 'name', callback, { enumerable: true });
  let descriptor = Object.getOwnPropertyDescriptor(object, 'name');
  it('add computed property descriptor at given property name', () => {
    expect(descriptor).toMatchObject({
      configurable: false,
      enumerable: true,
      set: undefined,
    });
  });
  it('expect callback to not be called until property read', () => {
    expect(callback.mock.calls.length).toBe(0);
  });
  it('expect name to provide expected valued', () => {
    expect((object as MayHaveName).name).toEqual('taras');
  });
  it('expect callback to be called when property is ready', () => {
    expect(callback.mock.calls.length).toBe(1);
  });
  it('expect callback to only be called once', () => {
    (object as MayHaveName).name;
    expect(callback.mock.calls.length).toBe(1);
  });
});
