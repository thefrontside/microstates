import 'jest';

import { create } from 'microstates';

describe('created without value', () => {
  let object;
  beforeEach(() => {
    object = create(Object);
  });

  it('has transitions', () => {
    expect(object).toMatchObject({
      set: expect.any(Function),
      assign: expect.any(Function)
    });
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

    describe('assign twice', () => {
      let assignedAgain;
      beforeEach(() => {
        assignedAgain = assigned.assign({ bar: 'baz' });
      });
  
      it('received the assigned value', () => {
        expect(assignedAgain.valueOf()).toEqual({ foo: 'bar', bar: 'baz' });
      });
    });
  });
});

describe('created with value', () => {
  let object;
  beforeEach(() => {
    object = create(Object, { foo: 'bar' });
  });

  it('has transitions', () => {
    expect(object).toMatchObject({
      set: expect.any(Function),
      assign: expect.any(Function)
    });
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