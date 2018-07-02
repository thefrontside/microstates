import 'jest';
import { create } from 'microstates';

describe('cart example', () => {
  class Cart {
    products = Array;
    get price() {
      return this
        .products.reduce((acc, product) => acc.increment(product.quantity.state * product.price.state), 0)
        .products;
    }
    get count() {
      return this
        .products.reduce((acc, product) => acc.increment(product.quantity.state), 0)
        .products;
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
      expect(ms.state.count).toEqual(3);
      // expect(ms.price.state).toEqual(50);
    });
    it('provides valueOf', () => {
      expect(ms.valueOf()).toEqual({
        products: [{ quantity: 1, price: 10 }, { quantity: 2, price: 20 }],
      });
    });
  });
});
