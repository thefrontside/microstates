import 'jest';

import microstate, * as MS from '../../src';

describe('boolean', () => {
  let ms = microstate(MS.Boolean);
  it('toggles', () => {
    expect(ms.valueOf()).toBeFalsy();
    expect(ms.toggle().valueOf()).toBe(true);
  });
});
