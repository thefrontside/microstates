import 'jest';

import microstate, * as MS from '../../src';

describe('number', () => {
  let ms = microstate(MS.Number, 10);
  it('subtract', () => {
    expect(ms.subtract(5).valueOf()).toBe(5);
  });
  it('sum', () => {
    expect(ms.sum(5).valueOf()).toBe(15);
  });
  it('increment', () => {
    expect(ms.increment().valueOf()).toBe(11);
  });
  it('decrement', () => {
    expect(ms.decrement().valueOf()).toBe(9);
  });
});
