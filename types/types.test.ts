import { expectType } from 'ts-expect';
import {
  create,
  StringType,
  BooleanType,
  Any,
  NumberType,
  ArrayType,
  ObjectType,
  from
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
    expectType<ArrayType<StringType>>(a.sort((a, b) => (a > b ? 1 : 0)));
  });
  it('has filter transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(
      a.filter(item => item.state + '!!!' === 'hello!!!')
    );
  });
  it('has map transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(a.map(item => item.concat('!!!')));
  });
  it('has remove transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(a.remove('hello'));
  });
  it('has clear transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(a.clear());
  });
  it('has initialize transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(a.initialize('foo'));
  });
  it('has set transition that returns ArrayType', () => {
    expectType<ArrayType<StringType>>(a.set(['bye', 'world']));
  });
});

describe('ObjectType', () => {
  let o = create(ObjectType.of(NumberType), { a: 42, b: 2 });
  it('has entries', () => {
    expectType<{
    [key: string]: NumberType;
    }>(o.entries);
  });
  it('has a put transition that returns an ObjectType', () => {
    expectType<ObjectType<NumberType>>(o.put('c', 'foo'));
  });
  it('has a delete transition that returns an ObjectType', () => {
    expectType<ObjectType<NumberType>>(o.delete('a'));
  });
  it('has an assign transition that returns an ObjectType', () => {
    expectType<ObjectType<NumberType>>(o.assign({ d: 'DDDD' }));
  });
  it('has a map transition that returns an ObjectType', () => {
    expectType<ObjectType<NumberType>>(o.map(item => item.increment()));
  });
  it('has a filter transition that returns an ArrayType', () => {
    expectType<ObjectType<NumberType>>(o.filter(item => item.state > 10));
  });
  it('has initialize transition that returns an ArrayType', () => {
    expectType<ObjectType<NumberType>>(o.initialize({ hello: 'world'}))
  });
});

describe('from', () => {
  it('returns a NumberType when passed a number', () => {
    expectType<NumberType>(from(42))
  });
  it('returns a StringType when passed a string', () => {
    expectType<StringType>(from(""))
  });
  it('returns a BooleanType when passed a boolean', () => {
    expectType<BooleanType>(from(true))
    expectType<BooleanType>(from(false))
  });
  it('returns an Any when passed undefined', () => {
    expectType<Any>(from(undefined))
    expectType<Any>(from())
  });
});
