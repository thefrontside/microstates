import 'jest';
import Microstate, { create }  from 'microstates';
import { reveal } from 'microstates';
import logTree from '../src/utils/log-tree';

class Car {
  speed = Number;
  increaseSpeed(amount) {
    return this.speed.sum(amount);
  }
}
class Road {
  vehicle = Car;
}

describe('transition', () => {
  describe('without initial value', () => {
    let ms, faster;
    beforeEach(() => {
      ms = create(Road);
      faster = ms.vehicle.increaseSpeed(10);
    });
    it('uses current state value', () => {
      expect(faster.valueOf()).toEqual({ vehicle: { speed: 10 } });
    });
  });
  describe('with initial value', () => {
    let ms, faster;
    beforeEach(() => {
      ms = create(Road, { vehicle: { speed: 10 } });
      faster = ms.vehicle.increaseSpeed(10);
    });
    it('creates initial value', () => {
      expect(faster.valueOf()).toEqual({ vehicle: { speed: 20 } });
    });
  });
  describe('chained operations', function() {
    let ms, m1, m2, v1, v2;
    beforeEach(() => {
      ms = create(Road);
      m1 = ms.vehicle.increaseSpeed(10);
      let m1t = reveal(m1);
      v1 = m1.valueOf();
      m2 = m1.vehicle.increaseSpeed(20);
      let m2t = reveal(m2);
      v2 = m2.valueOf();
    });
    it('should maintain root after 1st transition', () => {
      expect(m1).toMatchObject({
        vehicle: {
          increaseSpeed: expect.any(Function)
        }
      });
      expect(v1).toEqual({ vehicle: { speed: 10 } });
      expect(v2).toEqual({ vehicle: { speed: 30 } });
    });
  });
});

describe('context', () => {
  let context;
  let result;
  beforeEach(() => {
    class State {
      items = Array;
      custom() {
        context = this;
      }
    }
    let { custom } = create(State);
    custom();
  });
  it('is a function', () => {
    expect(context).toBeInstanceOf(Microstate);
  });
  it.skip('excludes custom transtions from context', () => {
    expect(context).not.toHaveProperty('custom');
  });
  it('returns transitions', () => {
    expect(context).toMatchObject({
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
    text = String;
  }
  class Modal {
    isOpen = Boolean;
    title = String;
    content = ModalContent;
  }
  class State {
    messages = Array;
    modal = Modal;

    addItemAndShowModal(message, prompt) {
      return this
        .messages.push(message)
        .modal.isOpen.set(true)
        .modal.content.text.set(prompt);
    }
  }
  let ms;
  let result;
  beforeEach(() => {
    ms = create(State, { modal: { title: 'Confirmation' } });
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
