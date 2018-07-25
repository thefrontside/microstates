import expect from 'expect';
import { create } from "../src/microstates";
import ArrayType from "../src/types/array";
import SymbolObservable from 'symbol-observable';
import { from } from 'rxjs';

class NumberType {
  initialize(value) {
    return Number(value);
  }
  increment() {
    return this.state + 1;
  }
}

describe('rxjs interop', function() {
  let ms, observable, observer, last;
  let observerCalls;
  beforeEach(() => {
    observerCalls = 0;
    ms = create(NumberType, 42);
    observer = next => {
      observerCalls++;
      return last = next;
    };

    observable = from(ms);
    let subscription = observable.subscribe(observer);

    last.increment();
    last.increment();
    last.increment();
  });
  it('sent 4 states to obsever', function() {
    expect(observerCalls).toBe(4);
  });
  it('incremented 3 times', function() {
    expect(last.state).toBe(45);
  });
});

describe('interop', function() {
  let ms, observable;
  beforeEach(() => {
    ms = create(NumberType, 10);
    observable = ms[SymbolObservable]();
  });

  it('observable has subscribe', () => {
    expect(observable.subscribe).toBeInstanceOf(Function);
  });

  it('observable has reference to self', () => {
    expect(observable[SymbolObservable]()).toBe(observable);
  });
});

describe("initial value", function() {
  let observable, last, unsubscribe;
  beforeEach(function() {
    let ms = create(NumberType, 10);
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
    let ms = create(NumberType, 10);
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
    let ms = create(NumberType, 10);
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
    b = create(class B {
      c = create(class C {
        values = create(ArrayType);
      });
    });
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
  let call;
  class Modal {
    isOpen = create(class BooleanType {});

    initialize(value) {
      if (!value) {
        return create(Modal, { isOpen: true });
      }
      return this;
    }
  }

  it('streams initialized microstate', () => {
    let calls = 0;
    let state;
    let call = function call(next) {
      calls++;
      state = next.state
    }
    from(create(Modal)).subscribe(call);
    expect(calls).toBe(1);
    expect(state).toEqual({
      isOpen: true
    });
  });
});

describe('array as root', () => {
  let list;
  beforeEach(() => {
    list = create(ArrayType, [{ hello: 'world' }]);
  });

  it('has array with one element', () => {
    expect(list.state.length).toBe(1);
    expect(list[0].state.hello).toBeDefined();
  });

  describe('created observable', () => {
    let observable, last, isCalledCallback;
    beforeEach(() => {
      observable = from(list);
      observable.subscribe(next => {
        isCalledCallback = true;
        last = next;
      });
    });

    it('called callback', () => {
      expect(isCalledCallback).toBe(true);
    });

    it('has array with one element', () => {
      expect(last.state.length).toBe(1);
      expect(last[0].state.hello).toBeDefined();
    });
  });

});
