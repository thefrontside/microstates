import expect from 'expect';
import { create } from '../../src/picostates';
import { ObjectType } from '../../src/types';

describe('created without value', () => {
  class Thing {
  };
  let object;
  beforeEach(() => {
    object = create(ObjectType.of(Thing));
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
      expect(assigned.state).toEqual({ foo: 'bar' });
    });
    it('wraps the assigned values the parameterized type', function() {
      expect(assigned.foo).toBeInstanceOf(Thing)
      expect(assigned.foo.state).toEqual('bar')
    });

    describe('assign twice', () => {
      let assignedAgain;
      beforeEach(() => {
        assignedAgain = assigned.assign({ bar: 'baz' });
      });

      it('received the assigned value', () => {
        expect(assignedAgain.state).toEqual({ foo: 'bar', bar: 'baz' });
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
    object = create(ObjectType, { foo: 'bar' });
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
      expect(assigned.state).toEqual({ foo: 'bar', bar: 'baz' });
    });

    describe('assign twice', () => {
      let assignedAgain;
      beforeEach(() => {
        assignedAgain = assigned.assign({ zoo: 'zar' });
      });

      it('received the assigned value', () => {
        expect(assignedAgain.state).toEqual({ foo: 'bar', bar: 'baz', zoo: 'zar' });
      });
    });
  });

  describe('assign microstate', () => {
    describe('primitive type', () => {
      let assigned;
      beforeEach(() => {
        assigned = object.assign({
          name: create(class StringType {}, 'Taras')
        });
      });

      it('assigned is not a microstate', () => {
        expect(assigned.name.state).toBe('Taras');
      });

      it('microstate value to be part of valueOf', () => {
        expect(assigned.state).toEqual({ foo: 'bar', name: 'Taras' });
      });
    });

    describe('composed type', () => {
      class Person {
        name = create(class StringType {});
      }

      let assigned, value;
      beforeEach(() => {
        value = create(Person, { name: 'Taras' });
        assigned = object.assign({
          taras: value
        })
      });

      it('has new type in the state', () => {
        expect(assigned.taras).toBeInstanceOf(Person);
      });

      it('is stable', () => {
        expect(assigned.state.taras).toBe(value.state);
      });
    });
  });
});

describe('put and delete', () => {
  let object;
  beforeEach(() => {
    object = create(ObjectType, {a: 'b'});
  })

  describe('putting a value or two', function() {
    beforeEach(function() {
      object = object.put('w', 'x').put('y', 'z');
    });
    it('includes those values in the state', function() {
      expect(object.state).toEqual({a: 'b', w: 'x', y: 'z'});
    });
    describe('deleting a value', function() {
      beforeEach(() => {
        object = object.delete('w');
      });
      it('removes it from the value', function() {
        expect(object.state).toEqual({a: 'b', y: 'z'})
      });
    });
  });

  describe('putting microstate', () => {
    describe('primitive value', () => {
      beforeEach(() => {
        object = object.put('name', create(class StringType {}, 'Taras'));
      });

      it('has name string', () => {
        expect(object.name.state).toBe('Taras');
      });

      it('has valueOf', () => {
        expect(object.state).toEqual({ a: 'b', name: 'Taras' });
      });
    })

    describe('composed type', () => {
      class Person {
        name = create(class StringType {});
      }

      let value;
      beforeEach(() => {
        value = create(Person, { name: 'Taras' });
        object = object.put('taras', value);
      });

      it('has new type in the state', () => {
        expect(object.taras).toBeInstanceOf(Person);
      });

      it('is stable', () => {
        expect(object.state.taras).toBe(value.state);
      });
    });
  });
})
