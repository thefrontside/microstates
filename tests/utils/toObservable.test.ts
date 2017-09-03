import 'jest';

import toObservable from '../../src/toObservable';

describe('toObservable', () => {
  describe('instance', () => {
    let observable;
    beforeEach(() => {
      observable = toObservable(Boolean);
    });
    it('has transitions object', () => {
      expect(observable.transitions).toBeDefined();
    });
    it('has toggle transition', () => {
      expect(observable.transitions.toggle).toBeDefined();
    });
  });
  describe('subscription', () => {
    let observable;
    let subscription;
    let observer;
    beforeEach(() => {
      observer = {
        next: jest.fn(),
      };
      observable = toObservable(Boolean);
      subscription = observable.subscribe(observer);
    });
    it('received a subscription', () => {
      expect(subscription).toBeDefined();
    });
    it('subscription has unsubscribe method', () => {
      expect(subscription.unsubscribe).toBeDefined();
    });
    it(`called observer's next`, () => {
      expect(observer.next.mock.calls.length).toBe(1);
    });
    it('recieved the initial value', () => {
      expect(observer.next.mock.calls[0][0]).toEqual(false);
    });
  });
  describe('stream', () => {
    let observable;
    let subscription;
    let observer;
    beforeEach(() => {
      observer = {
        next: jest.fn(),
      };
      observable = toObservable(Boolean);
      subscription = observable.subscribe(observer);
    });
    describe('transition', () => {
      describe('once', () => {
        let result;
        beforeEach(() => {
          result = observable.transitions.toggle();
        });
        it('pushed two values', () => {
          expect(observer.next.mock.calls.length).toBe(2);
        });
        it('result is undefined', () => {
          expect(result).toBeUndefined();
        });
        it('pushes next value', () => {
          expect(observer.next.mock.calls[1][0]).toBe(true);
        });
      });
      describe('many times', () => {
        let result;
        beforeEach(() => {
          observable.transitions.toggle();
          observable.transitions.toggle();
          observable.transitions.toggle();
        });
        it('pushed four values', () => {
          expect(observer.next.mock.calls.length).toBe(4);
        });
        it('1st toggle makes it true', () => {
          expect(observer.next.mock.calls[1][0]).toBe(true);
        });
        it('2nd toggle makes it false', () => {
          expect(observer.next.mock.calls[2][0]).toBe(false);
        });
        it('3rd toggle makes it true', () => {
          expect(observer.next.mock.calls[3][0]).toBe(true);
        });
      });
      describe('unsubscribe', () => {
        beforeEach(() => {
          subscription.unsubscribe();
          observable.transitions.toggle();
        });
        it('only nexted one value', () => {
          expect(observer.next.mock.calls.length).toBe(1);
        });
      });
    });
  });
});
