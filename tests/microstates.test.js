import 'jest';

import Microstates from '../src/microstates';
import { Object as ObjectType, Number, String, Array, Boolean } from '../src';

describe('microstates', () => {
  describe('for Number', () => {
    describe('without initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Number);
      });
      it('has states', () => {
        expect(ms).toHaveProperty('states', 0);
      });
      it('has transitions', () => {
        expect(ms).toMatchObject({
          transitions: {
            set: expect.any(Function),
            increment: expect.any(Function),
          },
        });
      });
      it('returns new state on transition', () => {
        expect(ms.transitions.increment()).toBe(1);
      });
    });
    describe('with initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Number, 3);
      });
      it('returns new state on transition', () => {
        expect(ms.transitions.increment()).toBe(4);
      });
    });
  });
  describe('for shallow composition', () => {
    class State {
      name = String;
      isOpen = Boolean;
    }
    describe('without initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(State);
      });
      it('initializes default', () => {
        expect(ms).toHaveProperty('states', { name: '', isOpen: false });
      });
      it('has transitions', () => {
        expect(ms).toMatchObject({
          transitions: {
            set: expect.any(Function),
            merge: expect.any(Function),
            name: {
              set: expect.any(Function),
              concat: expect.any(Function),
            },
            isOpen: {
              set: expect.any(Function),
              toggle: expect.any(Function),
            },
          },
        });
      });
      it('replaces value when set is called on the node', () => {
        expect(ms.transitions.set({ name: 'taras' })).toEqual({ name: 'taras' });
      });
      it('replaces value when set is called on leaf state', () => {
        expect(ms.transitions.name.set('taras')).toEqual({ name: 'taras', isOpen: false });
      });
    });
    describe('with initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(State, { isOpen: true });
      });
      it('uses provided state', () => {
        expect(ms).toHaveProperty('states', { name: '', isOpen: true });
      });
      it('replaces value when set is called but uses provided value', () => {
        expect(ms.transitions.name.set('taras')).toEqual({ name: 'taras', isOpen: true });
      });
      it('merges value on merge transition', () => {
        expect(ms.transitions.merge({ name: 'taras' })).toEqual({ name: 'taras', isOpen: true });
      });
    });
  });
  describe('shallow composition with arrays and objects', () => {
    class State {
      animals = Array;
      config = ObjectType;
    }
    describe('without initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(State);
      });
      it('initialies with default', () => {
        expect(ms).toHaveProperty('states', {
          animals: [],
          config: {},
        });
      });
      it('returns a new object with value pushed into an array', () => {
        expect(ms.transitions.animals.push('cat')).toEqual({
          animals: ['cat'],
          config: {},
        });
      });
      it('return a new object with value assigned into the object', () => {
        expect(ms.transitions.config.assign({ x: 10, y: 20 })).toEqual({
          config: { x: 10, y: 20 },
          animals: [],
        });
      });
    });
    describe('with initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(State, { animals: ['cat', 'dog'], config: { color: 'red' } });
      });
      it('uses provided value', () => {
        expect(ms).toHaveProperty('states', {
          animals: ['cat', 'dog'],
          config: { color: 'red' },
        });
      });
      it('returns a new object with value pushed into an array', () => {
        expect(ms.transitions.animals.push('bird')).toEqual({
          animals: ['cat', 'dog', 'bird'],
          config: { color: 'red' },
        });
      });
      it('return a new object with value assigned into the object', () => {
        expect(ms.transitions.config.assign({ x: 10, y: 20 })).toEqual({
          animals: ['cat', 'dog'],
          config: { x: 10, y: 20, color: 'red' },
        });
      });
    });
  });
  describe('recursive composition', () => {
    class Container {
      contains = Container;
      x = Number;
      y = Number;
    }
    describe('without initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Container);
      });
      it('initializes first level', () => {
        expect(ms).toMatchObject({
          states: {
            contains: expect.any(Object),
            x: 0,
            y: 0,
          },
        });
      });
      it('initializes recursively', () => {
        expect(ms).toMatchObject({
          states: {
            contains: {
              x: 0,
              y: 0,
              contains: expect.any(Object),
            },
            x: 0,
            y: 0,
          },
        });
      });
      it('transitions non recursive value', () => {
        expect(ms.transitions.x.increment()).toEqual({
          x: 1,
          contains: {},
          y: 0,
        });
      });
      it('transition recursive value', () => {
        expect(ms.transitions.contains.y.increment()).toEqual({
          contains: {
            y: 1,
            contains: {},
            x: 0,
          },
          y: 0,
          x: 0,
        });
      });
    });
    describe('with initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(Container, {
          x: 10,
          y: 0,
          contains: { y: 20, x: 0, contains: { x: 30, y: 25, contains: {} } },
        });
      });
      it('restores state tree from initial value', () => {
        expect(ms).toMatchObject({
          states: {
            x: 10,
            y: 0,
            contains: {
              y: 20,
              x: 0,
              contains: {
                x: 30,
                y: 25,
              },
            },
          },
        });
      });
      it('transitions deeply nested state', () => {
        expect(ms.transitions.contains.contains.x.increment()).toEqual({
          x: 10,
          y: 0,
          contains: { y: 20, contains: { x: 31, y: 25, contains: {} }, x: 0 },
        });
      });
      it('transitions deeply nested state without initial value', () => {
        expect(ms.transitions.contains.contains.contains.y.decrement()).toEqual({
          x: 10,
          y: 0,
          contains: {
            y: 20,
            x: 0,
            contains: { x: 30, y: 25, contains: { y: -1, x: 0, contains: {} } },
          },
        });
      });
    });
  });
  describe('deep composition', () => {
    class Session {
      token = String;
    }
    class Authentication {
      isAuthenticated = Boolean;
      session = Session;
    }
    class State {
      authentication = Authentication;
    }
    describe('without initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(State);
      });
      it('builds state tree', () => {
        expect(ms).toMatchObject({
          states: {
            authentication: {
              isAuthenticated: false,
              session: {
                token: '',
              },
            },
          },
        });
      });
      it('transitions deeply nested state', () => {
        expect(ms.transitions.authentication.session.token.set('SECRET')).toEqual({
          authentication: {
            isAuthenticated: false,
            session: { token: 'SECRET' },
          },
        });
      });
    });
    describe('with initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(State, {
          authentication: { isAuthenticated: true, session: { token: 'SECRET' } },
        });
      });
      it('builds state tree', () => {
        expect(ms).toMatchObject({
          states: {
            authentication: {
              isAuthenticated: true,
              session: {
                token: 'SECRET',
              },
            },
          },
        });
      });
    });
  });
  describe('custom transitions', () => {
    class Car {
      speed = Number;
      increaseSpeed(current = {}, amount) {
        let { speed = 0 } = current;
        return {
          speed: speed + amount,
        };
      }
    }
    class State {
      vehicle = Car;
    }
    describe('transition', () => {
      describe('without initial value', () => {
        let ms;
        beforeEach(() => {
          ms = Microstates.from(State);
        });
        it('uses current state value', () => {
          expect(ms.transitions.vehicle.increaseSpeed(10)).toEqual({ vehicle: { speed: 10 } });
        });
      });
      describe('with initial value', () => {
        let ms;
        beforeEach(() => {
          ms = Microstates.from(State, { vehicle: { speed: 10 } });
        });
        it('creates initial value', () => {
          expect(ms.transitions.vehicle.increaseSpeed(10)).toEqual({ vehicle: { speed: 20 } });
        });
      });
    });
  });
  describe('computed properties support', () => {
    class State {
      firstName = String;
      lastName = String;
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
    }
    describe('without initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(State);
      });
      it('is computed', function() {
        expect(ms).toMatchObject({
          states: {
            fullName: ' ',
          },
        });
      });
    });
    describe('with initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates.from(State, { firstName: 'Peter', lastName: 'Griffin' });
      });
      it('is computed', () => {
        expect(ms).toMatchObject({
          states: {
            fullName: 'Peter Griffin',
          },
        });
      });
    });
  });
});
