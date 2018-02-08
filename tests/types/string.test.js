import 'jest';

import Microstate from '../../src';

describe('string transitions', () => {
  let ms = Microstate.create(String);
  it('concat', () => {
    expect(ms.concat(' foo').valueOf()).toBe(' foo');
  });
});
