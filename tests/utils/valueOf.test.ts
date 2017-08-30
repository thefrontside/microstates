import 'jest';

import microstates from '../../src/microstates';
import valueOf from '../../src/utils/valueOf';

describe('valueOf', () => {
  describe('cycle dependency', () => {
    class Product {
      name = String;
      related = [Product];
    }
    let ms;
    beforeEach(() => {
      ms = microstates(Product, { name: 'MacBook', related: [{ name: 'iPhone' }] });
    });
    it('deserializes circular schema', () => {
      expect(valueOf(ms.state)).toEqual({
        name: 'MacBook',
        related: [{ name: 'iPhone', related: [] }],
      });
    });
  });
});
