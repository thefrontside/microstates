import 'jest';
import { map } from 'funcadelic';
import microstate, * as MS from '../src';

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
      ms = microstate(State);
    });
    it('uses current state value', () => {
      expect(ms.vehicle.increaseSpeed(10).valueOf()).toEqual({ vehicle: { speed: 10 } });
    });
  });
  describe('with initial value', () => {
    let ms;
    beforeEach(() => {
      ms = microstate(State, { vehicle: { speed: 10 } });
    });
    it('creates initial value', () => {
      expect(ms.vehicle.increaseSpeed(10).valueOf()).toEqual({ vehicle: { speed: 20 } });
    });
  });
  describe('chained operations', function() {
    it('should maintain root', function() {
      expect(
        microstate(State)
          .vehicle.increaseSpeed(10)
          .vehicle.increaseSpeed(20)
          .valueOf()
      ).toEqual({ vehicle: { speed: 30 } });
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
    let { custom } = microstate(State);
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
    ms = microstate(State, { modal: { title: 'Confirmation' } });
    result = ms.addItemAndShowModal('Hello World', 'You have a message');
  });
  it('returns merged state', () => {
    expect(result.valueOf()).toEqual({
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