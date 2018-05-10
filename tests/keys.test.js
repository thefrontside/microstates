import 'jest';

import keys from '../src/keys';

let arr = ['foo', 'bar', null, undefined];
let obj = { a: 'A', 2: 'two', get three() { return 3 }, method() {} };

it('returns an array of indexes for an array', () => {
  expect(keys(arr)).toEqual([0, 1, 2, 3]);
  expect(keys([])).toEqual([]);
});

it('returns an array of keys for object', () => {
  expect(keys(obj)).toEqual(['2', 'a', 'three', 'method']);
  expect(keys({})).toEqual([]);
});