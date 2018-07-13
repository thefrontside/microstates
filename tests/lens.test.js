import 'jest';
import { map } from 'funcadelic';
import { 
  compose,
  Const,
  Id,
  lensKey,
  lensPath,
  view,
  over,
  set,
  transparent
} from '../src/lens';

describe('Constant functor', () => {
  const { of, unbox } = Const;
  const five = of(5);

  it('can place a value into a constant box and get that value back', () => {
    expect(unbox(five)).toEqual(5);
  });
  
  it('does not change the value at all in the constant box when you map over it because it is constant!', () => {
    expect(unbox(map(value => value * 10, five))).toEqual(5);
  })
});

describe('Identity functor', () => {
  const { of, unbox } = Id;
  const number = of(5);

  it('can place a value into an id and get it out again', function() {
    expect(unbox(number)).toEqual(5);
  });

  it('applies the mapping function to the value in Id, and returns a new Id', function() {
    expect(unbox(map(v => v * 10, number))).toEqual(50);
  });
});

describe('Basic lenses', () => {
  const hello = lensKey('hello');

  it('can get from a transparent lens', () => {
    expect(view(transparent, 5)).toEqual(5);
    expect(over(transparent, value => value * 2, 5)).toEqual(10);
  });

  it('lets you update an object property', () => {
    expect(over(hello, v => `${v}!`, {hello: 'World'})).toEqual({hello: 'World!'});
  })

  it('let you set an object key', () => {
    expect(set(hello, 'Planet!', {hello: 'World'})).toEqual({hello: 'Planet!'});
  });

  it('lets you get a value from a key', () => {
    expect(view(hello, {hello: 'World!'})).toEqual('World!');
  });
});

describe('Composing lenses', () => {
  const hello = lensKey('hello');
  const message = lensKey('message');
  const message_hello = compose(message, hello);

  it('can be used to access deeply nested values', () => {
    expect(view(message_hello, { message: { hello: 'world' }})).toEqual('world');
  });
});

describe('lensPath', () => {
  const message_hello = lensPath(['message', 'hello']);

  it('can be used to access deeply nested values', () => {
    expect(view(message_hello, { message: { hello: 'world' }})).toEqual('world');
  });

  it('can be used to set deeply nested values', () => {
    expect(set(message_hello, 'planet', {message: {hello: 'world' }}))
      .toEqual({message: { hello: 'planet'}});
  });
});

describe('Lens laws', () => {
  describe('Path lens', () => {
    const message_hello = lensPath(['message', 'hello']);
    const obj = { message: { hello: 'world' } };

    it('view retrieves what set puts in (set-get)', () => {
      expect(view(message_hello, set(message_hello, 'world!', obj))).toBe('world!');
    });

    it('setting the focus to the value it already has does not change the whole (get-set)', () => {
      expect(set(message_hello, 'world', obj)).toBe(obj);
    });

    it('setting the focus twice is the same as setting it once (set-set)', () => {
      const exampleOne = set(message_hello, 'world!', obj);
      const exampleTwo = set(message_hello, 'world!!!', obj);
      expect(set(message_hello, 'world!!!', exampleOne))
        .toEqual(exampleTwo); // TODO: Stretch goal, triple equals
    });
  });

  describe('Prop lens', () => {
    const message = lensKey('message');

    it('view retrieves what set puts in (set-get)', () => {
      expect(view(message, set(message, 'Hello world!', { message: 'meh.' }))).toBe('Hello world!');
    });

    it('setting the focus to the value it already has does not change the whole (get-set)', () => {
      expect(set(message, 'meh.', { message: 'meh.' })).toBe({ message: 'meh.'});
    });

    it('setting the focus twice is the same as setting it once (set-set)', () => {
      const exampleOne = set(message, 'Hello world!', { message: 'meh.' });
      const exampleTwo = set(message, 'Hello world!!!', { message: 'meh.' });
      expect(set(message, 'Hello world!!!', exampleOne))
        .toEqual(exampleTwo); // TODO: Stretch goal, triple equals
    });
  });
});