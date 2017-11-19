import Microstate from '../../src/utils/microstate';
import 'jest';

import Microstates, * as MS from '../../src';

describe('boolean', () => {
  let ms = Microstates(MS.Boolean);
  it('toggles', () => {
    expect(ms.valueOf()).toBeFalsy();
    expect(ms.toggle().valueOf()).toBe(true);
  });
});
