import 'jest';

import values from '../src/values';

let arr = ['foo', 'bar', null, undefined];
let obj = { a: 'A', 2: 'two', get three() { return 3 }, method() {} };

it('returns a new array', () => {
  expect(values(arr)).not.toBe(arr);
});

it('returns values for an array', () => {
  expect(values(arr)).toEqual(['foo', 'bar', null, undefined]);
});

it('returns an array for object', () => {
  expect(values(obj)).toEqual(['two', 'A', 3, obj.method]);
})
