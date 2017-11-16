import 'jest';

import Microstates, * as MS from '../src';

describe('microstates', () => {
  describe('for Number', () => {
    describe('without initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(MS.Number);
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
        ms = Microstates(MS.Number, 3);
      });
      it('returns new state on transition', () => {
        expect(ms.transitions.increment()).toBe(4);
      });
    });
  });
  describe('for shallow composition', () => {
    class State {
      name = MS.String;
      isOpen = MS.Boolean;
    }
    describe('without initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(State);
      });
      it('is instance of State', () => {
        expect(ms.states).toBeInstanceOf(State);
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
        expect(ms.transitions.name.set('taras')).toEqual({ name: 'taras' });
      });
    });
    describe('with initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(State, { isOpen: true });
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
      animals = MS.Array;
      config = MS.Object;
    }
    describe('without initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(State);
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
        });
      });
      it('return a new object with value assigned into the object', () => {
        expect(ms.transitions.config.assign({ x: 10, y: 20 })).toEqual({
          config: { x: 10, y: 20 },
        });
      });
    });
    describe('with initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(State, { animals: ['cat', 'dog'], config: { color: 'red' } });
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
      x = MS.Number;
      y = MS.Number;
    }
    describe('without initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(Container);
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
        });
      });
      it('transition recursive value', () => {
        expect(ms.transitions.contains.y.increment()).toEqual({
          contains: {
            y: 1,
          },
        });
      });
    });
    describe('with initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(Container, {
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
            contains: { x: 30, y: 25, contains: { y: -1 } },
          },
        });
      });
    });
  });
  describe('deep composition', () => {
    class Session {
      token = MS.String;
    }
    class Authentication {
      isAuthenticated = MS.Boolean;
      session = Session;
    }
    class State {
      authentication = Authentication;
    }
    describe('without initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(State);
      });
      it('builds state tree', () => {
        expect(ms).toMatchObject({
          states: {
            authentication: {
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
            session: { token: 'SECRET' },
          },
        });
      });
    });
    describe('with initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(State, {
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
      speed = MS.Number;
      increaseSpeed(current, amount) {
        return this().speed.sum(amount);
      }
    }
    class State {
      vehicle = Car;
    }
    describe('transition', () => {
      describe('without initial value', () => {
        let ms;
        beforeEach(() => {
          ms = Microstates(State);
        });
        it('uses current state value', () => {
          expect(ms.transitions.vehicle.increaseSpeed(10)).toEqual({ vehicle: { speed: 10 } });
        });
      });
      describe('with initial value', () => {
        let ms;
        beforeEach(() => {
          ms = Microstates(State, { vehicle: { speed: 10 } });
        });
        it('creates initial value', () => {
          expect(ms.transitions.vehicle.increaseSpeed(10)).toEqual({ vehicle: { speed: 20 } });
        });
      });
    });
    describe('context', () => {
      let context;
      let result;
      beforeEach(() => {
        class State {
          items = MS.Array;
          custom() {
            context = this;
          }
        }
        let { transitions: { custom } } = Microstates(State);
        custom();
      });
      it('is a function', () => {
        expect(context).toBeInstanceOf(Function);
      });
      it.skip('excludes custom transtions from context', () => {
        expect(context()).not.toHaveProperty('custom');
      });
      it('returns transitions', () => {
        expect(context()).toMatchObject({
          items: {
            push: expect.any(Function),
          },
          merge: expect.any(Function),
          set: expect.any(Function),
        });
      });
    });
    describe('type shifting', () => {
      describe('of root state', () => {
        class Choice {
          topic = MS.String;
          yes(current, reason) {
            return this(Yes).affirmation.set(reason);
          }
          no(current, reason) {
            return this(No).refutation.set(reason);
          }
        }
        class No extends Choice {
          refutation = MS.String;
        }
        class Yes extends Choice {
          affirmation = MS.String;
        }
        let ms, yes, no;
        beforeEach(() => {
          ms = Microstates(Choice, { topic: 'Microstates are tiny' });
          yes = ms.yes('So tiny.');
          no = ms.no('They huge.');
        });
        it('returns affirmation for yes', () => {
          expect(yes.valueOf()).toEqual({ topic: 'Microstates are tiny', affirmation: 'So tiny.' });
        });
        it('returns refutation for no', () => {
          expect(no.valueOf()).toEqual({ topic: 'Microstates are tiny', refutation: 'They huge.' });
        });
        it(`changed the root's structure`, () => {
          expect(yes).toMatchObject({
            states: {
              topic: 'Microstates are tiny',
              affirmation: 'So tiny.',
            },
          });
        });
      });
    });
    describe('merging', () => {
      class ModalContent {
        text = MS.String;
      }
      class Modal {
        isOpen = MS.Boolean;
        title = MS.String;
        content = ModalContent;
      }
      class State {
        messages = MS.Array;
        modal = Modal;

        addItemAndShowModal(current, message, prompt) {
          return this()
            .messages.push(message)
            .modal.isOpen.set(true)
            .modal.content.text.set(prompt);
        }
      }
      let ms;
      let result;
      beforeEach(() => {
        ms = Microstates(State, { modal: { title: 'Confirmation' } });
        result = ms.transitions.addItemAndShowModal('Hello World', 'You have a message');
      });
      it('returns merged state', () => {
        expect(result).toEqual({
          messages: ['Hello World'],
          modal: {
            isOpen: true,
            title: 'Confirmation',
            content: {
              text: 'You have a message',
            },
          },
        });
      });
    });
  });
  describe('computed properties support', () => {
    class State {
      firstName = MS.String;
      lastName = MS.String;
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
    }
    describe('without initial state', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(State);
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
        ms = Microstates(State, { firstName: 'Peter', lastName: 'Griffin' });
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
  describe('cart example', () => {
    class Cart {
      products = MS.Array;
      get price() {
        return this.products.reduce((acc, product) => acc + product.quantity * product.price, 0);
      }
      get count() {
        return this.products.reduce((acc, product) => acc + product.quantity, 0);
      }
    }
    describe('adding products without initial value', () => {
      let ms;
      beforeEach(() => {
        ms = Microstates(Cart)
          .products.push({ quantity: 1, price: 10 })
          .products.push({ quantity: 2, price: 20 });
      });
      it('adds items to the cart', () => {
        expect(ms).toMatchObject({
          states: {
            price: 50,
            count: 3,
            products: [{ quantity: 1, price: 10 }, { quantity: 2, price: 20 }],
          },
        });
      });
      it('provides valueOf', () => {
        expect(ms.valueOf()).toEqual({
          products: [{ quantity: 1, price: 10 }, { quantity: 2, price: 20 }],
        });
      });
    });
  });
  describe('value', () => {
    let ms = Microstates(MS.Number, 10);
    it('returns passed in value of', () => {
      expect(ms.valueOf()).toBe(10);
    });
    it('has value on value property', () => {
      expect(ms).toHaveProperty('value', 10);
    });
  });
});
