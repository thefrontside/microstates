import 'jest';

import create from '../../src';

describe('boolean', () => {
  let ms = create(Boolean);
  it('toggles', () => {
    expect(ms.valueOf()).toBeFalsy();
    expect(ms.toggle().valueOf()).toBe(true);
  });
});
