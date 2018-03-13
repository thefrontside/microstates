import "jest";
import { create, from } from "microstates";
import { reveal } from "../src/utils/secret";

it("exports create", function() {
  expect(create).toBeInstanceOf(Function);
});

describe("create", () => {
  it(`uses valueOf microstates instance that's passed to it`, () => {
    class Person {
      name = String;
    }
    let value = { name: "Taras" };
    let m1 = create(Person, value);
    expect(create(Person, m1).valueOf()).toBe(value);
  });
});

describe("valueOf", () => {
  let ms;
  beforeEach(() => {
    ms = create(Number, 10);
  });
  it("returns passed in value of", () => {
    expect(ms.valueOf()).toBe(10);
  });
  it("is not enumerable", () => {
    expect(Object.keys(ms).indexOf("valueOf")).toBe(-1);
  });
});

describe("from", () => {
  it("is defined", () => {
    expect(from).toBeInstanceOf(Function);
  });

  it("makes a number to microstate", () => {
    let ms = from(42);
    expect(ms).toMatchObject({
      increment: expect.any(Function),
    });
    expect(ms.state).toBe(42);
    expect(ms.valueOf()).toBe(42);
  });

  it("makes a boolean into a microstate", () => {
    let ms = from(true);
    expect(ms).toMatchObject({
      toggle: expect.any(Function),
    });
    expect(ms.state).toBe(true);
    expect(ms.valueOf()).toBe(true);
  });

  it("makes a string into a microstate", () => {
    let ms = from("hello world");
    expect(ms).toMatchObject({
      concat: expect.any(Function),
    });
    expect(ms.state).toBe("hello world");
    expect(ms.valueOf()).toBe("hello world");
  });

  it("throws an error for undefined or null", () => {
    expect(() => {
      from(null);
    }).toThrowError(/Can not convert null to a microstate with from./);
    expect(() => {
      from(undefined);
    }).toThrowError(/Can not convert undefined to a microstate with from./);
  });

  it("converts a primitive value on a ", () => {
    let value = { string: "hello world", number: 42, boolean: false };
    let ms = from(value);
    expect(ms).toMatchObject({
      string: {
        concat: expect.any(Function),
      },
      number: {
        increment: expect.any(Function),
      },
      boolean: {
        toggle: expect.any(Function),
      },
    });
    expect(ms.valueOf()).toBe(value);
  });

  it("allows to transition shallow composed object", () => {
    let original = { counter: 42 };
    let incremented = from(original).counter.increment();
    expect(original).toEqual({ counter: 42 });
    expect(incremented.state).toEqual({ counter: 43 });
  });

  it("allows to transition deeply composed object", () => {
    let original = { a: { b: { c: true } } };
    let toggled = from(original).a.b.c.toggle();
    expect(original).toEqual({ a: { b: { c: true } } });
    expect(toggled.state).toMatchObject({ a: { b: { c: false } } });
  });

  let value = [true, "hello world", 42];
  let shallowArray = from(value);

  it("builds microstate for an array of primitive values", () => {
    expect(shallowArray).toMatchObject({
      0: { toggle: expect.any(Function) },
      1: { concat: expect.any(Function) },
      2: { increment: expect.any(Function) },
    });
    expect(shallowArray.valueOf()).toBe(value);
  });

  it("allows to transition a primitive value in shallow array", () => {
    let toggled = shallowArray[0].toggle();
    expect(toggled.valueOf()).toEqual([false, "hello world", 42]);
    expect(value).toEqual([true, "hello world", 42]);

    let longer = shallowArray[1].concat("!!!");
    expect(longer.valueOf()).toEqual([true, "hello world!!!", 42]);
    expect(value).toEqual([true, "hello world", 42]);

    let incremented = shallowArray[2].increment();
    expect(incremented.valueOf()).toEqual([true, "hello world", 43]);
    expect(value).toEqual([true, "hello world", 42]);
  });

  it("allows to transition an array with deeply nested objects", () => {
    let value = [{ a: { b: { c: true } } }];
    let toggled = from(value)[0].a.b.c.toggle();
    expect(toggled.valueOf()).toEqual([{ a: { b: { c: false } } }]);
  });

  it("allows to transition an array composed into an array", () => {
    let value = [[[ true ]]];
    let toggled = from(value)[0][0][0].toggle();
    expect(toggled.valueOf()).toEqual([[[false]]]);
  });
});
