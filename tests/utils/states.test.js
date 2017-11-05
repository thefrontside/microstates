import 'jest';

import States from '../../src/utils/states';
import Tree from '../../src/utils/tree';

describe('States', () => {
  describe('supports constants', () => {
    let tree = Tree.from(
      class {
        n = 10;
        b = true;
        s = 'hello';
        o = { hello: 'world' };
        a = ['a', 'b', 'c'];
      }
    );
    let states = States(tree).collapsed;
    it('includes constants in states tree', () => {
      // once transition-context is merged, need to add collapsed to
      // the end of States().
      expect(states).toEqual({
        n: 10,
        b: true,
        s: 'hello',
        o: { hello: 'world' },
        a: ['a', 'b', 'c'],
      });
    });
  });
});
