import expect from 'expect';

import { create } from '../../src/microstates';
import { reduce } from '../../src/query';

describe('cart example', () => {
  class Cart {
    products = create(Array);

    get price() {
      return reduce(this.products, (acc, product) => acc + product.state.quantity * product.state.price, 0);
    }

    get count() {
      return reduce(this.products, (acc, product) => acc + product.state.quantity, 0);
    }
  }

  describe('adding products without initial value', () => {
    let ms;
    beforeEach(() => {
      ms = create(Cart, { products: [] })
        .products.push({ quantity: 1, price: 10 })
        .products.push({ quantity: 2, price: 20 });
    });
    it('adds items to the cart', () => {
      expect(ms.price).toEqual(50);
      expect(ms.count).toEqual(3);
      expect(ms.state).toMatchObject({
        products: [{ quantity: 1, price: 10 }, { quantity: 2, price: 20 }],
      });
    });
    it('provides state', () => {
      expect(ms.state).toEqual({
        products: [{ quantity: 1, price: 10 }, { quantity: 2, price: 20 }],
      });
    });
  });
});
