import { expectType } from 'ts-expect';
import {
  create,
  StringType,
  BooleanType,
  Any,
  NumberType,
  ArrayType
} from 'microstates';

describe('Any', () => {
  let a: Any;
  beforeEach(() => {
    a = create(Any);
  });
  it('creates an Any', () => {
    expectType<Any>(a);
  });
  it('has any state', () => {
    expectType<any>(a.state);
  });
});

describe('StringType', () => {
  let s: StringType;
  beforeEach(() => {
    s = create(StringType);
  });
  it('creates a StringType', () => {
    expectType<StringType>(s);
  });
  it('has string state', () => {
    expectType<string>(s.state);
  });
  it('has a set transition that returns a StringType', () => {
    expectType<StringType>(s.set('foo'));
  });
  it('has a concat transition that returns a StringType', () => {
    expectType<StringType>(s.concat('hello'));
  });
  it('has an initialize transition that return StringType', () => {
    expectType<StringType>(s.initialize(123));
  });
});

describe('BooleanType', () => {
  let b: BooleanType;
  beforeEach(() => {
    b = create(BooleanType);
  });
  it('creates a BooleanType', () => {
    expectType<BooleanType>(b);
  });
  it('has a boolean state', () => {
    expectType<boolean>(b.state);
  });
  it('has a toggle transition that returns a BooleanType', () => {
    expectType<BooleanType>(b.toggle());
  });
  it('has initialize transition that returns a BooleanType', () => {
    expectType<BooleanType>(b.initialize('something'));
  });
});

describe('NumberType', () => {
  let n: NumberType;
  beforeEach(() => {
    n = create(NumberType);
  });
  it('creates a NumberType', () => {
    expectType<NumberType>(n);
  });
  it('has a number state', () => {
    expectType<number>(n.state);
  });
  it('has increment transition that returns a NumberType', () => {
    expectType<NumberType>(n.increment());
  });
  it('has decrement transition that returns a NumberType', () => {
    expectType<NumberType>(n.decrement());
  });
  it('has initialize transition that returns a NumberType', () => {
    expectType<NumberType>(n.initialize('123'));
  });
});

describe('ArrayType', () => {
  let a: ArrayType<StringType>;
  beforeEach(() => {
    a = create(ArrayType.of(StringType), ['hello', 'world']);
  });
  it('has length property which is a number', () => {
    expectType<number>(a.length);
  });
  it('has a push transition that returns an ArrayType', () => {
    expectType<ArrayType<StringType>>(a.push('foo'));
  });
  it('has a pop transition that returns an ArrayType', () => {
    expectType<ArrayType<StringType>>(a.pop());
  });
  it('has a shift transition that returns an ArrayType', () => {
    expectType<ArrayType<StringType>>(a.shift());
  });
  it('has an unshift transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(a.unshift('boo'));
  });
  it('has slice transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(a.slice());
  });
  it('has sort transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(
      a.sort((a, b) => (a > b ? 1 : 0))
    );
  });
  it('has filter transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(
      a.filter((item) => (item.state + '!!!') === 'hello!!!')
    )
  });
});
