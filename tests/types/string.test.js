import 'jest';

import create from '../../src';

describe('string transitions', () => {
  let ms = create(String);
  it('concat', () => {
    expect(ms.concat(' foo').valueOf()).toBe(' foo');
  });
});
