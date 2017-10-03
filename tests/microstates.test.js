import 'jest';

import Microstates from '../src';

describe('microstates', () => {
  class Person {
    details = Object;
    age = Number;
    pets = Array;
  }
  class Todo {
    title = String;
    isCompleted = Boolean;
    owner = Person;
  }
  describe('states', () => {
    describe('initialize', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Todo);
      });
      it('initializes the state', () => {
        expect(ms.states).toEqual({
          title: '',
          isCompleted: false,
          owner: { details: {}, age: 0, pets: [] },
        });
      });
      it('initialized with class instances', () => {
        expect(ms.states).toBeInstanceOf(Todo);
        expect(ms.states.owner).toBeInstanceOf(Person);
      });
    });
    describe('restore from state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Todo, {
          title: 'Write a test',
          isCompleted: true,
          owner: { details: { gender: 'male' }, age: 35, pets: ['dog', 'cat', 'fish'] },
        });
      });
      it('restores from state', () => {
        expect(ms.states).toEqual({
          title: 'Write a test',
          isCompleted: true,
          owner: { details: { gender: 'male' }, age: 35, pets: ['dog', 'cat', 'fish'] },
        });
      });
      it('initialized with class instances', () => {
        expect(ms.states).toBeInstanceOf(Todo);
        expect(ms.states.owner).toBeInstanceOf(Person);
      });
    });
  });
  describe('transitions', () => {
    describe('continuious', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Todo);
        ms = ms.to(ms.transitions.title.set('Hello World'));
        ms = ms.to(ms.transitions.owner.age.increment());
      });
      it('accumulated transitions', () => {
        expect(ms.states).toEqual({
          title: 'Hello World',
          isCompleted: false,
          owner: { details: {}, age: 1, pets: [] },
        });
      });
    });
    describe('set', () => {
      describe('root', () => {
        function describe_root_set(value) {
          describe(value, () => {
            let result;
            beforeEach(() => {
              let { transitions } = Microstates.from(Todo);
              result = transitions.set(value);
            });
            it(`replaced root with "${value}"`, () => {
              expect(result).toBe(value);
            });
          });
        }
        describe_root_set(null);
        describe_root_set('');
        describe_root_set(0);
        describe_root_set(false);
        describe_root_set({});
        describe_root_set([]);
      });
      describe('shallow', () => {
        let result;
        beforeEach(() => {
          let { transitions } = Microstates.from(Todo);
          result = transitions.title.set('foo');
        });
        it('replaced shallow property with foo', () => {
          expect(result).toEqual({
            title: 'foo',
            isCompleted: false,
            owner: { details: {}, age: 0, pets: [] },
          });
        });
      });
      describe('deep', () => {
        let result;
        beforeEach(() => {
          let { transitions } = Microstates.from(Todo);
          result = transitions.owner.age.set(null);
        });
        it('replaced age property with null', () => {
          expect(result).toEqual({
            title: '',
            isCompleted: false,
            owner: { details: {}, age: null, pets: [] },
          });
        });
      });
    });
    describe('merge', () => {
      describe('root', () => {
        let result;
        beforeEach(() => {
          let { transitions } = Microstates.from(Todo);
          result = transitions.merge({
            isCompleted: true,
            owner: { details: { hairColor: 'blonde' }, age: 10, pets: ['dog'] },
          });
        });
        it('deeply merged hash into root', () => {
          expect(result).toEqual({
            title: '',
            isCompleted: true,
            owner: { details: { hairColor: 'blonde' }, age: 10, pets: ['dog'] },
          });
        });
      });
    });
  });
});
