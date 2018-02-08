import 'jest';

import Microstate from '../../src';

describe('boolean', () => {
  let ms = Microstate.create(Boolean);
  it('toggles', () => {
    expect(ms.valueOf()).toBeFalsy();
    expect(ms.toggle().valueOf()).toBe(true);
  });
});
