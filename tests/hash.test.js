import expect from 'expect';
import { Hash, equals } from '../src/hash';

describe('hash', () => {
  class OneValue {
    constructor(value) {
      this.value = value;
    }
  }

  Hash.instance(OneValue, {
    digest(object) {
      return [object.value];
    }
  })

  class TwoValues {
    constructor(one, two) {
      this.one = one;
      this.two = two;
    }
  }

  class TwoValuesPlus extends TwoValues {
    static Type = TwoValues;
  }

  Hash.instance(TwoValues, {
    digest(object) {
      return [object.one, object.two]
    }
  })

  it('can test equivalence between two hashable things', function() {
    expect(equals(new OneValue(5), new OneValue(5))).toEqual(true);
    expect(equals(new OneValue(5), new OneValue(6))).toEqual(false);
    expect(equals(new TwoValues(5, 10), new TwoValuesPlus(5, 10))).toEqual(true);
  });
})
