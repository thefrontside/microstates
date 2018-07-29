import expect from 'expect';

import { create } from '../../src/microstates';
import { ArrayType } from '../../src/types';
import { reduce, map } from '../../src/query';

describe('cart example', () => {
  class Cart {
    products = create(ArrayType);

    get price() {
      return reduce(this.products, (acc, product) => acc + product.state.quantity * product.state.price, 0);
    }

    get count() {
      return reduce(this.products, (acc, product) => acc + product.state.quantity, 0);
    }

    get prices() {
      return map(this.products, product => product.state.price);
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
    it('maps products', () => {
      expect(ms.prices).toEqual([10, 20]);
    });
  });
});
