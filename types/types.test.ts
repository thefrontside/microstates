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
  it('returns an ArrayType when passed an empty array', () => {
    let a = from([]);
    expectType<ArrayType<Any>>(a)
  });
  it('returns an ArrayType<NumberType> when passed an array with numbers', () => {
    let a = from([1, 2, 3]);
    expectType<ArrayType<NumberType>>(a);
  });
  it('returns an ArrayType<StringType> when passed an array with strings', () => {
    let a = from(['hello', 'world']);
    expectType<ArrayType<StringType>>(a);
  });
  it('returns an ArrayType<BooleanType> when passed an array with objects', () => {
    let a = from([true, false]);
    expectType<ArrayType<BooleanType>>(a);
  });
  it('returns an ArrayType<Any> when passed an array with mixed types', () => {
    let a = from([true, 41, "hello"]);
    expectType<ArrayType<NumberType | StringType | BooleanType>>(a);
  });
  it('returns an ObjectType<Any> when passed an object', () => {
    let o = from({});
    expectType<ObjectType<Any>>(o);
  });
  it('returns an ObjectType<NumberType> when passed an object with numbers', () => {
    let o = from({ a: 42, b: 2 });
    expectType<ObjectType<NumberType>>(o);
  });
  it('returns an ObjectType<StringType> when passed an object with strings', () => {
    let o = from({ a: 'hello', b: 'world' });
    expectType<ObjectType<StringType>>(o);
  });
  it('returns an ObjectType<BooleanType> when passed an object with booleans', () => {
    let o = from({ a: true, b: false });
    expectType<ObjectType<BooleanType>>(o);
  });
  it('return an ObjectType<NumberType | StringType | BooleanType> when passed an object with mixed types', () => {
    let o = from({ a: true, b: 42, c: 'hello world'});
    expectType<ObjectType<NumberType | StringType | BooleanType>>(o);
  });
  it('returns an ObjectType<ArrayType<NumberType>> when passed an object with arrays of numbers as values', () => {
    let o = from({
      a: [42],
      b: [2]
    })
    expectType<ObjectType<ArrayType<NumberType>>>(o)
  });
  it('returns an ObjectType<ArrayType<StringType>> when passed an object with arrays of strings as values', () => {
    let o = from({
      a: ['hello'],
      b: ['world']
    });
    expectType<ObjectType<ArrayType<StringType>>>(o);
  });
  it('returns an ObjecType<ArrayType<BooleanType>> when passed an object with arrays of booleans as values', () => {
    let o = from({
      a: [true],
      b: [false]
    });
    expectType<ObjectType<ArrayType<BooleanType>>>(o);
  });
  it('returns an ObjecType<ArrayType<BooleanType | StringType | NumberType>> when passed an array of mixed values', () => {
    let o = from({
      a: [true, 'hello world', 42],
      b: [42, false, 'foo']
    });
    expectType<ObjectType<ArrayType<BooleanType | StringType | NumberType>>>(o);
  });

  // NOTE: I'm not sure if this is possible
  // it('returns an ArrayType<ObjectType<NumberType>> when passed an array of objects with number values', () => {
  //   let a = from([
  //     { a: 42 }, { b: 2 }
  //   ]);
  //   expectType<ArrayType<ObjectType<NumberType>>>(a);
  // });

  // NOTE: this is not possible because TypeScript doesn't support recursive types
  // it('returns an ObjectType<ObjectType<Number>> when passed an object containing numbers', () => {
  //   let o = from({
  //     a: {
  //       b: 42
  //     },
  //     c: {
  //       d: 2
  //     }
  //   });
  //   expectType<ObjectType<ObjectType<Number>>>(o);
  // });
});
