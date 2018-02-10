import 'jest';

import { create } from 'microstates';

describe('string transitions', () => {
  let ms = create(String);
  it('concat', () => {
    expect(ms.concat(' foo').valueOf()).toBe(' foo');
  });
});
