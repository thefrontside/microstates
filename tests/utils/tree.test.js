import 'jest';

import Tree from '../../src/utils/tree';

describe('utils/tree', () => {
  it('instantiates without params', () => {
    expect(() => {
      new Tree();
    }).not.toThrow();
  });
});
