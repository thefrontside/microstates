import "jest";
import { create } from "microstates";
import SymbolObservable from 'symbol-observable';
import { from } from 'rxjs';

describe('rxjs interop', function() {
  let ms, observable, observer, last;
  beforeEach(() => {
    ms = create(Number, 42);
    observer = jest.fn(next => last = next);
    observable = from(ms);
    let subscription = observable.subscribe(observer);
    last.increment();
    last.increment();
    last.increment();
  });
  it('sent 4 states to obsever', function() {
    expect(observer.mock.calls).toHaveLength(4);
  });
  it('incremented 3 times', function() {
    expect(last.state).toBe(45);
  });
});

describe('interop', function() {
  let ms, observable;
  beforeEach(() => {
    ms = create(Number, 10);
    observable = ms[SymbolObservable]();
  });

  it('observable has subscribe', () => {
    expect(observable).toMatchObject({
      subscribe: expect.any(Function)
    });
  });

  it('observable has reference to self', () => {
    expect(observable[SymbolObservable]()).toBe(observable);
  });
});

describe("initial value", function() {
  let observable, last, unsubscribe;
  beforeEach(function() {
    let ms = create(Number, 10);
    observable = ms[SymbolObservable]();
    observable.subscribe(v => (last = v));
  });
  it("comes from microstate", function() {
    expect(last.state).toBe(10);
  });
});

describe("single transition", function() {
  let observable, last, unsubscribe;
  beforeEach(function() {
    let ms = create(Number, 10);
    observable = ms[SymbolObservable]();
    observable.subscribe(v => (last = v));
    last.increment();
  });
  it("gets next value after increment", function() {
    expect(last.state).toBe(11);
  });
});

describe("many transitions", function() {
  let observable, last, unsubscribe;
  beforeEach(function() {
    let ms = create(Number, 10);
    observable = ms[SymbolObservable]();
    observable.subscribe(v => (last = v));
    last
      .increment()
      .increment()
      .increment();
  });
  it("gets next value after multiple increments", function() {
    expect(last.state).toBe(13);
  });
});

describe("complex type", function() {
  class A {
    b = class B {
      c = class C {
        values = Array;
      };
    };
  }

  let observable, last;
  beforeEach(function() {
    let ms = create(A, { b: { c: { values: ["hello", "world"] } } });
    observable = ms[SymbolObservable]();
    observable.subscribe(v => (last = v));
  });

  it("has deeply nested transitions", function() {
    expect(last.b.c.values.push).toBeInstanceOf(Function);
  });

  describe("invoking deeply nested", function() {
    beforeEach(function() {
      last.b.c.values.push("!!!");
    });
    it("changed the state", function() {
      expect(last.state.b.c.values).toEqual(["hello", "world", "!!!"]);
    });
  });
});

describe('initialized microstate', () => {
  class Modal {
    isOpen = Boolean;

    initialize(value) {
      if (!value) {
        return create(Modal, { isOpen: true });
      }
      return this;
    }
  }

  it('streams initialized microstate', () => {
    let fn = jest.fn();
    from(create(Modal)).subscribe(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0].state).toMatchObject({
      isOpen: true
    });
  });
});
