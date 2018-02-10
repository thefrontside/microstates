import 'jest';

import ArrayType from '../../src/types/array';
import { create } from 'microstates';

let array = ['a', 'b', 'c'];
let ms = create(Array, array);

it('constructor returns an array when receives another value', () => {
  expect(new ArrayType()).toEqual([]);
  expect(new ArrayType('foo')).toEqual(['foo']);
  expect(new ArrayType(false)).toEqual([false]);
});

it('constructor returns the array when one is passed', () => {
  expect(new ArrayType(array)).toBe(array);
});

it('filter removes items', () => {
  expect(ms.filter(v => v !== 'a').valueOf()).toEqual(['b', 'c']);
});

it('map applies to every item', () => {
  expect(ms.map(v => v.toUpperCase()).valueOf()).toEqual(['A', 'B', 'C']);
});

it('replace replaces first element', () => {
  expect(ms.replace('a', 'd').valueOf()).toEqual(['d', 'b', 'c']);
});

it('replace does not throw when replacing non-existing item', () => {
  expect(() => {
    ms.replace('e', 'd');
  }).not.toThrow();
});

it('replace returns same array when value not found', () => {
  expect(ms.replace('e', 'd').valueOf()).toBe(array);
});