import 'jest';

import { create } from 'microstates';

describe('created without value', () => {
  class Thing {
    constructor(value) {
      this.value = value;
    }
  };
  let object;
  beforeEach(() => {
    object = create({ Thing });
  });

  it('has empty object as state', () => {
    expect(object.state).toEqual({});
  });

  describe('assign once', () => {
    let assigned;
    beforeEach(() => {
      assigned = object.assign({ foo: 'bar' });
    });

    it('received the assigned value', () => {
      expect(assigned.valueOf()).toEqual({ foo: 'bar' });
    });
    it('wraps the assigned values the parameterized type', function() {
      expect(assigned.state.foo).toBeInstanceOf(Thing)
      expect(assigned.state.foo.value).toEqual('bar')
    });

    describe('assign twice', () => {
      let assignedAgain;
      beforeEach(() => {
        assignedAgain = assigned.assign({ bar: 'baz' });
      });

      it('received the assigned value', () => {
        expect(assignedAgain.valueOf()).toEqual({ foo: 'bar', bar: 'baz' });
      });
      it('maintains stability of the state', function() {
        expect(assignedAgain.state.foo).toBe(assigned.state.foo)
      });
    });
  });
});

describe('created with value', () => {
  let object;
  beforeEach(() => {
    object = create(Object, { foo: 'bar' });
  });

  it('has empty object as state', () => {
    expect(object.state).toEqual({ foo: 'bar' });
  });

  describe('assign once', () => {
    let assigned;
    beforeEach(() => {
      assigned = object.assign({ bar: 'baz' });
    });

    it('received the assigned value', () => {
      expect(assigned.valueOf()).toEqual({ foo: 'bar', bar: 'baz' });
    });

    describe('assign twice', () => {
      let assignedAgain;
      beforeEach(() => {
        assignedAgain = assigned.assign({ zoo: 'zar' });
      });

      it('received the assigned value', () => {
        expect(assignedAgain.valueOf()).toEqual({ foo: 'bar', bar: 'baz', zoo: 'zar' });
      });
    });
  });
});

describe('put and delete', () => {
  let object, put, deleted
  beforeEach(() => {
    object = create(Object, {a: 'b'});
  })

  describe('puting a value or two', function() {
    beforeEach(function() {
      object = object.put('w', 'x').put('y', 'z');
    });
    it('includes those values in the state', function() {
      expect(object.valueOf()).toMatchObject({a: 'b', w: 'x', y: 'z'});
    });
    describe('deleting a value', function() {
      beforeEach(() => {
        object = object.delete('w');
      });
      it('removes it from the value', function() {
        expect(object.valueOf()).toMatchObject({a: 'b', y: 'z'})
      });
    });

  });

})
