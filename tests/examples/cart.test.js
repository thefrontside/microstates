import 'jest';
import { create } from 'microstates';

describe('cart example', () => {
  class Cart {
    products = Array;
    get price() {
      return this.products.reduce((acc, product) => acc + product.quantity * product.price, 0);
    }
    get count() {
      return this.products.reduce((acc, product) => acc + product.quantity, 0);
    }
  }
  describe('adding products without initial value', () => {
    let ms;
    beforeEach(() => {
      ms = create(Cart)
        .products.push({ quantity: 1, price: 10 })
        .products.push({ quantity: 2, price: 20 });
    });
    it('adds items to the cart', () => {
      expect(ms.state.price).toEqual(50);
      expect(ms.state.count).toEqual(3);
      expect(ms.state).toMatchObject({
        products: [{ quantity: 1, price: 10 }, { quantity: 2, price: 20 }],
      });
    });
    it('provides valueOf', () => {
      expect(ms.valueOf()).toEqual({
        products: [{ quantity: 1, price: 10 }, { quantity: 2, price: 20 }],
      });
    });
  });
});
