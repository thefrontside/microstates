import 'jest';

import shallowDiffers from '../src/shallow-differs';

it('returns false for empty arrays', () => {
  expect(shallowDiffers([], [])).toBe(false);
});

it('returns false for empty objects', () => {
  expect(shallowDiffers({}, {})).toBe(false);
});

it('returns true for arrays of different lengths', () => {
  expect(shallowDiffers(['a', 'b'], ['a'])).toBe(true);
});

it('returns true for objects with different number of keys', () => {
  expect(shallowDiffers({a: 'a', b: 'b'}, { a: 'a'})).toBe(true);
});

it('returns true for arrays with different values but same lengths', () => {
  expect(shallowDiffers(['a'], ['b'])).toBe(true);
});

it('returns true for objects with same number of keys but different values', () => {
  expect(shallowDiffers({ a: 'a'}, { a: 'b'})).toBe(true);
});

it('returns true for objects with getters that return different values', () => {
  expect(shallowDiffers({ get a() { return 'A' }}, { get a() { return 'a' }})).toBe(true);
})

it('returns true for objects with different methods', () => {
  expect(shallowDiffers({ a() { } }, { b() {} })).toBe(true);
});