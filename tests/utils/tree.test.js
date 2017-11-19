import 'jest';

import Tree from '../../src/utils/tree';

describe('tree', () => {
  it('instantiates without params', () => {
    expect(() => {
      new Tree();
    }).not.toThrow();
  });
});
