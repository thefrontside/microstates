import Microstate from '../../src/utils/microstate';
import 'jest';

import Microstates, * as MS from '../../src';

describe('string', () => {
  let ms = Microstates(MS.String);
  it('concat', () => {
    expect(ms.concat(' foo').valueOf()).toBe(' foo');
  });
});
