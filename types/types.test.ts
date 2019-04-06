import { expectType } from "ts-expect";
import { create, StringType, BooleanType, Any, NumberType } from "microstates";

describe("Any", () => {
  let a: Any;
  beforeEach(() => {
    a = create(Any);
  });
  it("creates an Any", () => {
    expectType<Any>(a);
  });
  it("has any state", () => {
    expectType<any>(a.state);
  });
});

describe("StringType", () => {
  let s: StringType;
  beforeEach(() => {
    s = create(StringType);
  });
  it("creates a StringType", () => {
    expectType<StringType>(s);
  });
  it("has string state", () => {
    expectType<string>(s.state);
  });
  it("has a set transition that returns a StringType", () => {
    expectType<StringType>(s.set("foo"));
  });
  it("has a concat transition that returns a StringType", () => {
    expectType<StringType>(s.concat("hello"));
  });
  it('has an initialize transition that return StringType', () => {
    expectType<StringType>(s.initialize(123));
  });
});

describe("BooleanType", () => {
  let b: BooleanType;
  beforeEach(() => {
    b = create(BooleanType);
  });
  it("creates a BooleanType", () => {
    expectType<BooleanType>(b);
  });
  it("has a boolean state", () => {
    expectType<boolean>(b.state);
  });
  it("has a toggle transition that returns a BooleanType", () => {
    expectType<BooleanType>(b.toggle());
  });
  it("has initialize transition that returns a BooleanType", () => {
    expectType<BooleanType>(b.initialize("something"))
  });
});

describe("NumberType", () => {
  let n: NumberType;
  beforeEach(() => {
    n = create(NumberType);
  });
  it("creates a NumberType", () => {
    expectType<NumberType>(n);
  });
  it("has a number state", () => {
    expectType<number>(n.state);
  });
  it("has increment transition that returns a NumberType", () => {
    expectType<NumberType>(n.increment());
  });
  it("has initialize transition that returns a NumberType", () => {
    expectType<NumberType>(n.initialize("123"));
  });
});

